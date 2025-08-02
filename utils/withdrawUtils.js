function calculateWithdrawalFees(amount) {
  const fee = amount * 0.03;
  const perFee = parseFloat((amount * 0.01).toFixed(2));
  const finalAmount = parseFloat((amount - fee).toFixed(2));

  return {
    charityFee: perFee,
    liquidityFee: perFee,
    platformFee: perFee,
    finalUserAmount: finalAmount,
  };
}

module.exports = { calculateWithdrawalFees };
