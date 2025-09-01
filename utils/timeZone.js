const { DateTime } = require("luxon");
const ct = require("countries-and-timezones");

const getTimeZoneBidComparision = async (
  startDate,
  startTime,
  endDate,
  endTime,
  country
) => {
  try {
    if (!startDate || !startTime || !endDate || !endTime || !country)
      return false;

    // 1. Get timezone from country
    const countries = ct.getAllCountries();
    const matchedCountry = Object.values(countries).find(
      (c) => c.name.toLowerCase() === country.toLowerCase()
    );

    const timeZone = matchedCountry?.timezones?.[0] || "UTC";

    // 2. Format date (remove time part from native Date string)
    const parsedStartDate = DateTime.fromJSDate(new Date(startDate)).toFormat(
      "yyyy-MM-dd"
    );
    const parsedEndDate = DateTime.fromJSDate(new Date(endDate)).toFormat(
      "yyyy-MM-dd"
    );

    // 3. Combine date and time into timezone-aware DateTime
    const startDateTime = DateTime.fromFormat(
      `${parsedStartDate} ${startTime}`,
      "yyyy-MM-dd HH:mm",
      { zone: timeZone }
    );

    const endDateTime = DateTime.fromFormat(
      `${parsedEndDate} ${endTime}`,
      "yyyy-MM-dd HH:mm",
      { zone: timeZone }
    );

    // 4. Get current time in that timezone
    const now = DateTime.now().setZone(timeZone);

    // // Debug output (optional)
    // console.log("\n\n\n DETAILS:", {
    //   country,
    //   timeZone,
    //   now: now.toISO(),
    //   startDateTime: startDateTime.toISO(),
    //   endDateTime: endDateTime.toISO(),
    //   started: now >= startDateTime,
    // });

    // 5. Include only bids that have started
    // return now >= startDateTime;

    // 5. return bid event status
    if (now < startDateTime) {
    //   console.log("\n\n\n inactive");
      return "inactive";
    } else if (now == startDateTime) {
    //   console.log("\n\n\n active");
      return "active";
    } else if (now > startDateTime) {
      if (now <= endDateTime) {
        // console.log("\n\n\n active");
        return "active";
      } else {
        // console.log("\n\n\n completed");
        return "completed";
      }
    }
  } catch (error) {
    throw new Error("Error while comparing time");
  }
};

// ✅ CommonJS export
module.exports = { getTimeZoneBidComparision };
