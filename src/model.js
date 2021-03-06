exports.usageUpserter = function (client, row) {
  return function (cb) {
    client.query('INSERT INTO dw.fc_usage (ymd, platform, version, first_time, channel, total) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (ymd, platform, version, first_time, channel) DO UPDATE SET total = $6', [row._id.ymd, row._id.platform, row._id.version, row._id.first_time, row._id.channel, row.count], (err, result) => {
      cb(err)
    })
  }
}

exports.usageMonthlyUpserter = function (client, row) {
  return function (cb) {
    client.query('INSERT INTO dw.fc_usage_month (ymd, platform, version, channel, total) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ymd, platform, version, channel) DO UPDATE SET total = $5', [row._id.ymd, row._id.platform, row._id.version, row._id.channel, row.count], (err, result) => {
      cb(err)
    })
  }
}

exports.crashUpserter = function (client, row) {
  return function (cb) {
    client.query('INSERT INTO dw.fc_crashes (ymd, platform, version, channel, total) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ymd, platform, version, channel) DO UPDATE SET total = $5', [row._id.ymd, row._id.platform, row._id.version, row._id.channel, row.count], (err, result) => {
      cb(err)
    })
  }
}

// Also read exceptions from a table and insert / update
var exceptionsSQL = 'INSERT INTO dw.fc_usage ( ymd, platform, version, first_time, channel, total ) SELECT ymd, platform, version, first_time, channel, total from dw.fc_usage_exceptions ON CONFLICT (ymd, platform, version, first_time, channel ) DO UPDATE SET total = EXCLUDED.total'

exports.exceptionsUpserter = function (client) {
  return function (cb) {
    client.query(exceptionsSQL, [], function (err, result) {
      console.log("Updating exceptions")
      cb(err)
    })
  }
}

const MOVE_FASTLY_SQL = `
INSERT INTO dw.fc_usage ( ymd, platform, version, channel, first_time, total )
SELECT ymd, platform, version, channel, first_time, SUM(total) as ftotal
FROM dw.fc_fastly_usage FC
WHERE ymd = $1
GROUP BY ymd, platform, version, channel, first_time
ON CONFLICT (ymd, platform, version, first_time, channel) DO UPDATE SET total = EXCLUDED.total
`

export function moveFastlyToUsageForDay (pg, ymd, cb) {
  pg.query(MOVE_FASTLY_SQL, [ymd], cb)
}

const MOVE_FASTLY_MONTH_SQL = `
INSERT INTO dw.fc_usage_month ( ymd, platform, version, channel, total )
SELECT ymd, platform, version, channel, SUM(total) as ftotal
FROM dw.fc_fastly_calendar_month_usage FC
WHERE ymd = $1
GROUP BY ymd, platform, version, channel
ON CONFLICT (ymd, platform, version, channel) DO UPDATE SET total = EXCLUDED.total
`

export function moveFastlyMonthlyToUsageForDay (pg, ymd, cb) {
  pg.query(MOVE_FASTLY_MONTH_SQL, [ymd], cb)
}
