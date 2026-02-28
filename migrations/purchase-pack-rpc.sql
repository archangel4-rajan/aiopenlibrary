-- Atomic pack purchase function (prevents race conditions)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION purchase_pack(
  p_buyer_id uuid,
  p_pack_id uuid,
  p_creator_id uuid,
  p_zap_price integer,
  p_platform_cut integer DEFAULT 20
) RETURNS uuid AS $$
DECLARE
  v_creator_share integer;
  v_tx_id uuid;
  v_current_balance integer;
  v_item RECORD;
BEGIN
  -- Lock buyer's balance row
  SELECT balance INTO v_current_balance
  FROM zap_balances WHERE user_id = p_buyer_id FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_zap_price THEN
    RAISE EXCEPTION 'Insufficient Zap balance';
  END IF;

  -- Check not already purchased
  IF EXISTS (SELECT 1 FROM user_purchases WHERE user_id = p_buyer_id AND pack_id = p_pack_id) THEN
    RAISE EXCEPTION 'Already purchased';
  END IF;

  v_creator_share := p_zap_price - (p_zap_price * p_platform_cut / 100);

  -- Deduct from buyer
  UPDATE zap_balances 
  SET balance = balance - p_zap_price, 
      total_spent = total_spent + p_zap_price, 
      updated_at = now()
  WHERE user_id = p_buyer_id;

  -- Credit creator
  INSERT INTO zap_balances (user_id, balance, total_earned)
  VALUES (p_creator_id, v_creator_share, v_creator_share)
  ON CONFLICT (user_id) DO UPDATE 
  SET balance = zap_balances.balance + v_creator_share, 
      total_earned = zap_balances.total_earned + v_creator_share, 
      updated_at = now();

  -- Log buyer transaction
  INSERT INTO zap_transactions (user_id, type, amount, description, reference_type, reference_id)
  VALUES (p_buyer_id, 'spend', -p_zap_price, 'Pack purchase', 'pack', p_pack_id::text)
  RETURNING id INTO v_tx_id;

  -- Log creator earning
  INSERT INTO zap_transactions (user_id, type, amount, description, reference_type, reference_id)
  VALUES (p_creator_id, 'earn', v_creator_share, 'Pack sale', 'pack', p_pack_id::text);

  -- Record pack purchase
  INSERT INTO user_purchases (user_id, pack_id, zap_amount, transaction_id)
  VALUES (p_buyer_id, p_pack_id, p_zap_price, v_tx_id);

  -- Unlock all prompts in the pack
  FOR v_item IN SELECT prompt_id FROM prompt_pack_items WHERE pack_id = p_pack_id LOOP
    INSERT INTO user_purchases (user_id, prompt_id, zap_amount, transaction_id)
    VALUES (p_buyer_id, v_item.prompt_id, 0, v_tx_id)
    ON CONFLICT (user_id, prompt_id) DO NOTHING;
  END LOOP;

  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql;
