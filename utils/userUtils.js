const updateLoginInfo = async (Model, userId) => {
    const now = new Date();
  
    await Model.updateOne(
      { _id: userId },
      {
        $set: { lastLogin: now },
        $push: { loginHistory: { date: now } },
      }
    );
  };
  
  const getLoginFrequencyLast90Days = (loginHistory = []) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
    return loginHistory.filter((entry) => new Date(entry.date) >= ninetyDaysAgo)
      .length;
  };
  
  module.exports = {
    updateLoginInfo,
    getLoginFrequencyLast90Days,
  };
  