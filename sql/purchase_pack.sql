-- Atomic pack purchase RPC function
-- Same pattern as purchase_prompt and purchase_chain
-- Run this SQL in the Supabase SQL editor to create the function.

CREATE OR REPLACE FUNCTION purchase_pack(
  p_buyer_id UUID,
  p_pack_id UUID,
  p_creator_id UUID,
  p_zap_price INT,
  p_platform_cut INT -- percentage, e.g. 20 = 20%
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_creator_earning INT;
  v_cut INT;
  v_txn_id UUID;
  v_pack_name TEXT;
  v_prompt RECORD;
BEGIN
  -- Calculate splits
  v_cut := FLOOR(p_zap_price * p_platform_cut / 100);
  v_creator_earning := p_zap_price - v_cut;

  -- Get pack name for transaction descriptions
  SELECT name INTO v_pack_name FROM prompt_packs WHERE id = p_pack_id;

  -- Deduct from buyer
  UPDATE zap_balances
  SET balance = balance - p_zap_price,
      total_spent = total_spent + p_zap_price,
      updated_at = NOW()
  WHERE user_id = p_buyer_id
    AND balance >= p_zap_price;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Credit creator (ensure row exists)
  INSERT INTO zap_balances (user_id, balance, total_earned, total_spent)
  VALUES (p_creator_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE zap_balances
  SET balance = balance + v_creator_earning,
      total_earned = total_earned + v_creator_earning,
      updated_at = NOW()
  WHERE user_id = p_creator_id;

  -- Log transaction for buyer
  INSERT INTO zap_transactions (user_id, type, amount, description, reference_type, reference_id)
  VALUES (p_buyer_id, 'spend', -p_zap_price, 'Purchased pack: ' || COALESCE(v_pack_name, 'Unknown'), 'pack', p_pack_id)
  RETURNING id INTO v_txn_id;

  -- Log transaction for creator
  INSERT INTO zap_transactions (user_id, type, amount, description, reference_type, reference_id)
  VALUES (p_creator_id, 'earn', v_creator_earning, 'Pack sale: ' || COALESCE(v_pack_name, 'Unknown'), 'pack', p_pack_id);

  -- Create purchase record for the pack
  INSERT INTO user_purchases (user_id, pack_id, zap_amount, transaction_id)
  VALUES (p_buyer_id, p_pack_id, p_zap_price, v_txn_id);

  -- Create purchase records for each prompt in the pack
  FOR v_prompt IN
    SELECT prompt_id FROM prompt_pack_items WHERE pack_id = p_pack_id ORDER BY sort_order
  LOOP
    INSERT INTO user_purchases (user_id, prompt_id, pack_id, zap_amount, transaction_id)
    VALUES (p_buyer_id, v_prompt.prompt_id, p_pack_id, 0, v_txn_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN v_txn_id;
END;
$$;
