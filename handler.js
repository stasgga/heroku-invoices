"use strict";

module.exports.invoices = (event, context, callback) => {
  const Heroku = require("heroku-client");
  const heroku = new Heroku({ token: event.queryStringParameters.token });

  heroku.get("/account/invoices").then(invoices => {
    const pendingSortedByDateDesc = invoices
      .sort((a, b) => {
        return new Date(b.period_start) - new Date(a.period_start);
      })
      .filter(invoice => {
        return invoice.state === 0 && invoice.total > 0;
      });

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*" // Required for CORS support to work
      },
      body: JSON.stringify({
        invoices: pendingSortedByDateDesc.map(a => ({
          url: `https://particleboard.heroku.com/account/invoices/${a.number}`,
          total: a.total,
          startsOn: a.period_start
        })),
        event
      })
    };

    callback(null, response);
  });
};
