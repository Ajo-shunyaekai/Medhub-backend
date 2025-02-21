const corsOptions = {
  origin: [
    "http://192.168.1.31:2221",
    "http://192.168.1.82:3000",
    "http://192.168.1.42:3000",
    "http://192.168.1.87:3000",
    "http://192.168.1.53:3000",
    "http://localhost:2221",
    "http://localhost:3030",
    "http://localhost:8000",
    "http://192.168.1.34:3333",
    "http://192.168.1.218:3030",
    'http://192.168.1.2:3000',
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3333",
    "http://192.168.1.2:8000",
    "https://medhub.shunyaekai.com",
    "https://medhub.global",
    "https://checkout.stripe.com",
  ],
  methods: "GET, POST, PUT, PATCH, DELETE",
  credentials: true,
};

module.exports = { corsOptions };
