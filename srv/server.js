const express = require('express');
const app = express();
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    hana: { label: 'hana' }
});

// placed before authentication - business user info from the JWT will not be set as HANA session variables (XS_)
const hdbext = require('@sap/hdbext');
app.use(hdbext.middleware(services.hana));



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/srv', function (req, res) {
        res.status(200).send('SECROLES');
});





app.get('/srv/sales', function (req, res) {
        let sql = 'SELECT * FROM "SECROLES.db::sales"';
        req.db.exec(sql, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
});

app.get('/srv/session', function (req, res) {
        req.db.exec('SELECT * FROM M_SESSION_CONTEXT', function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
});

app.get('/srv/db', function (req, res) {
        req.db.exec('SELECT SYSTEM_ID, DATABASE_NAME, HOST, VERSION, USAGE FROM M_DATABASE', function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
});

app.get('/srv/connections', function (req, res) {
        req.db.exec(`SELECT TOP 10 USER_NAME, CLIENT_IP, CLIENT_HOST, START_TIME FROM M_CONNECTIONS WHERE OWN='TRUE' ORDER BY START_TIME DESC`, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
});



const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});