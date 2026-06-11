"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dayjs_min = { exports: {} };
(function(module2, exports) {
  !function(t, e) {
    module2.exports = e();
  }(commonjsGlobal, function() {
    var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
      var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
      return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
    } }, m = function(t2, e2, n2) {
      var r2 = String(t2);
      return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
    }, v = { s: m, z: function(t2) {
      var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
      return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
    }, m: function t2(e2, n2) {
      if (e2.date() < n2.date()) return -t2(n2, e2);
      var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
      return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
    }, a: function(t2) {
      return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
    }, p: function(t2) {
      return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
    }, u: function(t2) {
      return void 0 === t2;
    } }, g = "en", D = {};
    D[g] = M;
    var p = "$isDayjsObject", S = function(t2) {
      return t2 instanceof _ || !(!t2 || !t2[p]);
    }, w = function t2(e2, n2, r2) {
      var i2;
      if (!e2) return g;
      if ("string" == typeof e2) {
        var s2 = e2.toLowerCase();
        D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
        var u2 = e2.split("-");
        if (!i2 && u2.length > 1) return t2(u2[0]);
      } else {
        var a2 = e2.name;
        D[a2] = e2, i2 = a2;
      }
      return !r2 && i2 && (g = i2), i2 || !r2 && g;
    }, O = function(t2, e2) {
      if (S(t2)) return t2.clone();
      var n2 = "object" == typeof e2 ? e2 : {};
      return n2.date = t2, n2.args = arguments, new _(n2);
    }, b = v;
    b.l = w, b.i = S, b.w = function(t2, e2) {
      return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
    };
    var _ = function() {
      function M2(t2) {
        this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
      }
      var m2 = M2.prototype;
      return m2.parse = function(t2) {
        this.$d = function(t3) {
          var e2 = t3.date, n2 = t3.utc;
          if (null === e2) return /* @__PURE__ */ new Date(NaN);
          if (b.u(e2)) return /* @__PURE__ */ new Date();
          if (e2 instanceof Date) return new Date(e2);
          if ("string" == typeof e2 && !/Z$/i.test(e2)) {
            var r2 = e2.match($);
            if (r2) {
              var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
              return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
            }
          }
          return new Date(e2);
        }(t2), this.init();
      }, m2.init = function() {
        var t2 = this.$d;
        this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
      }, m2.$utils = function() {
        return b;
      }, m2.isValid = function() {
        return !(this.$d.toString() === l);
      }, m2.isSame = function(t2, e2) {
        var n2 = O(t2);
        return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
      }, m2.isAfter = function(t2, e2) {
        return O(t2) < this.startOf(e2);
      }, m2.isBefore = function(t2, e2) {
        return this.endOf(e2) < O(t2);
      }, m2.$g = function(t2, e2, n2) {
        return b.u(t2) ? this[e2] : this.set(n2, t2);
      }, m2.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, m2.valueOf = function() {
        return this.$d.getTime();
      }, m2.startOf = function(t2, e2) {
        var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
          var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
          return r2 ? i2 : i2.endOf(a);
        }, $2 = function(t3, e3) {
          return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
        }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
        switch (f2) {
          case h:
            return r2 ? l2(1, 0) : l2(31, 11);
          case c:
            return r2 ? l2(1, M3) : l2(0, M3 + 1);
          case o:
            var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
            return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
          case a:
          case d:
            return $2(v2 + "Hours", 0);
          case u:
            return $2(v2 + "Minutes", 1);
          case s:
            return $2(v2 + "Seconds", 2);
          case i:
            return $2(v2 + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, m2.endOf = function(t2) {
        return this.startOf(t2, false);
      }, m2.$set = function(t2, e2) {
        var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
        if (o2 === c || o2 === h) {
          var y2 = this.clone().set(d, 1);
          y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
        } else l2 && this.$d[l2]($2);
        return this.init(), this;
      }, m2.set = function(t2, e2) {
        return this.clone().$set(t2, e2);
      }, m2.get = function(t2) {
        return this[b.p(t2)]();
      }, m2.add = function(r2, f2) {
        var d2, l2 = this;
        r2 = Number(r2);
        var $2 = b.p(f2), y2 = function(t2) {
          var e2 = O(l2);
          return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
        };
        if ($2 === c) return this.set(c, this.$M + r2);
        if ($2 === h) return this.set(h, this.$y + r2);
        if ($2 === a) return y2(1);
        if ($2 === o) return y2(7);
        var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
        return b.w(m3, this);
      }, m2.subtract = function(t2, e2) {
        return this.add(-1 * t2, e2);
      }, m2.format = function(t2) {
        var e2 = this, n2 = this.$locale();
        if (!this.isValid()) return n2.invalidDate || l;
        var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
          return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
        }, d2 = function(t3) {
          return b.s(s2 % 12 || 12, t3, "0");
        }, $2 = f2 || function(t3, e3, n3) {
          var r3 = t3 < 12 ? "AM" : "PM";
          return n3 ? r3.toLowerCase() : r3;
        };
        return r2.replace(y, function(t3, r3) {
          return r3 || function(t4) {
            switch (t4) {
              case "YY":
                return String(e2.$y).slice(-2);
              case "YYYY":
                return b.s(e2.$y, 4, "0");
              case "M":
                return a2 + 1;
              case "MM":
                return b.s(a2 + 1, 2, "0");
              case "MMM":
                return h2(n2.monthsShort, a2, c2, 3);
              case "MMMM":
                return h2(c2, a2);
              case "D":
                return e2.$D;
              case "DD":
                return b.s(e2.$D, 2, "0");
              case "d":
                return String(e2.$W);
              case "dd":
                return h2(n2.weekdaysMin, e2.$W, o2, 2);
              case "ddd":
                return h2(n2.weekdaysShort, e2.$W, o2, 3);
              case "dddd":
                return o2[e2.$W];
              case "H":
                return String(s2);
              case "HH":
                return b.s(s2, 2, "0");
              case "h":
                return d2(1);
              case "hh":
                return d2(2);
              case "a":
                return $2(s2, u2, true);
              case "A":
                return $2(s2, u2, false);
              case "m":
                return String(u2);
              case "mm":
                return b.s(u2, 2, "0");
              case "s":
                return String(e2.$s);
              case "ss":
                return b.s(e2.$s, 2, "0");
              case "SSS":
                return b.s(e2.$ms, 3, "0");
              case "Z":
                return i2;
            }
            return null;
          }(t3) || i2.replace(":", "");
        });
      }, m2.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, m2.diff = function(r2, d2, l2) {
        var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
          return b.m(y2, m3);
        };
        switch (M3) {
          case h:
            $2 = D2() / 12;
            break;
          case c:
            $2 = D2();
            break;
          case f:
            $2 = D2() / 3;
            break;
          case o:
            $2 = (g2 - v2) / 6048e5;
            break;
          case a:
            $2 = (g2 - v2) / 864e5;
            break;
          case u:
            $2 = g2 / n;
            break;
          case s:
            $2 = g2 / e;
            break;
          case i:
            $2 = g2 / t;
            break;
          default:
            $2 = g2;
        }
        return l2 ? $2 : b.a($2);
      }, m2.daysInMonth = function() {
        return this.endOf(c).$D;
      }, m2.$locale = function() {
        return D[this.$L];
      }, m2.locale = function(t2, e2) {
        if (!t2) return this.$L;
        var n2 = this.clone(), r2 = w(t2, e2, true);
        return r2 && (n2.$L = r2), n2;
      }, m2.clone = function() {
        return b.w(this.$d, this);
      }, m2.toDate = function() {
        return new Date(this.valueOf());
      }, m2.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, m2.toISOString = function() {
        return this.$d.toISOString();
      }, m2.toString = function() {
        return this.$d.toUTCString();
      }, M2;
    }(), Y = _.prototype;
    return O.prototype = Y, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
      Y[t2[1]] = function(e2) {
        return this.$g(e2, t2[0], t2[1]);
      };
    }), O.extend = function(t2, e2) {
      return t2.$i || (t2(e2, _, O), t2.$i = true), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
      return O(1e3 * t2);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
  });
})(dayjs_min);
var dayjs_minExports = dayjs_min.exports;
const dayjs = /* @__PURE__ */ getDefaultExportFromCjs(dayjs_minExports);
class PumpDatabase {
  constructor() {
    __publicField(this, "db");
    const dbPath = path.join(electron.app.getPath("userData"), "pumping_station.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }
  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pumps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL,
        longitude REAL DEFAULT 0,
        latitude REAL DEFAULT 0,
        basin TEXT,
        designFlow REAL NOT NULL,
        head REAL NOT NULL,
        power REAL NOT NULL,
        equipmentModel TEXT NOT NULL,
        manufacturer TEXT,
        installDate TEXT,
        ratedCurrent REAL NOT NULL,
        maxCurrent REAL NOT NULL,
        forebayWarningLevel REAL NOT NULL,
        forebayDangerLevel REAL NOT NULL,
        upstreamPumpIds TEXT DEFAULT '[]',
        downstreamPumpIds TEXT DEFAULT '[]',
        status TEXT DEFAULT 'standby',
        totalRuntime INTEGER DEFAULT 0,
        startCount INTEGER DEFAULT 0,
        lastMaintenanceDate TEXT,
        nextMaintenanceDate TEXT,
        createTime TEXT DEFAULT (datetime('now')),
        updateTime TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pump_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pumpId INTEGER NOT NULL,
        unitNumber TEXT NOT NULL,
        equipmentModel TEXT NOT NULL,
        ratedFlow REAL NOT NULL,
        ratedHead REAL NOT NULL,
        ratedPower REAL NOT NULL,
        ratedCurrent REAL NOT NULL,
        status TEXT DEFAULT 'standby',
        isBackup INTEGER DEFAULT 0,
        runtime INTEGER DEFAULT 0,
        startCount INTEGER DEFAULT 0,
        FOREIGN KEY (pumpId) REFERENCES pumps(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheduleDate TEXT NOT NULL,
        pumpId INTEGER NOT NULL,
        pumpName TEXT NOT NULL,
        planStartTime TEXT NOT NULL,
        planEndTime TEXT NOT NULL,
        plannedFlow REAL NOT NULL,
        operatingUnits TEXT DEFAULT '[]',
        reason TEXT,
        constraints TEXT,
        status TEXT DEFAULT 'draft',
        approver TEXT,
        approvalComment TEXT,
        approvalTime TEXT,
        operator TEXT,
        confirmTime TEXT,
        adjustReason TEXT,
        adjustRequestTime TEXT,
        createTime TEXT DEFAULT (datetime('now')),
        updateTime TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (pumpId) REFERENCES pumps(id)
      );

      CREATE TABLE IF NOT EXISTS monitoring_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pumpId INTEGER NOT NULL,
        unitId INTEGER,
        timestamp TEXT DEFAULT (datetime('now')),
        current REAL NOT NULL,
        voltage REAL DEFAULT 380,
        flow REAL NOT NULL,
        head REAL NOT NULL,
        forebayLevel REAL NOT NULL,
        outletPressure REAL DEFAULT 0,
        vibration REAL DEFAULT 0,
        temperature REAL DEFAULT 25,
        isAlert INTEGER DEFAULT 0,
        alertLevel TEXT,
        FOREIGN KEY (pumpId) REFERENCES pumps(id),
        FOREIGN KEY (unitId) REFERENCES pump_units(id)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pumpId INTEGER NOT NULL,
        unitId INTEGER,
        alertType TEXT NOT NULL,
        alertLevel TEXT NOT NULL,
        parameter TEXT NOT NULL,
        actualValue REAL NOT NULL,
        threshold REAL NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT DEFAULT (datetime('now')),
        acknowledged INTEGER DEFAULT 0,
        acknowledgedBy TEXT,
        acknowledgedTime TEXT,
        autoAction TEXT,
        autoActionResult TEXT
      );

      CREATE TABLE IF NOT EXISTS maintenance_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderNo TEXT UNIQUE NOT NULL,
        pumpId INTEGER NOT NULL,
        unitId INTEGER,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        description TEXT NOT NULL,
        triggerReason TEXT,
        triggerValue TEXT DEFAULT '{}',
        assignedTeam TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        partsRequired TEXT DEFAULT '[]',
        planDate TEXT NOT NULL,
        actualStartDate TEXT,
        actualEndDate TEXT,
        remark TEXT,
        createTime TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partNo TEXT UNIQUE NOT NULL,
        partName TEXT NOT NULL,
        specification TEXT,
        unit TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        safeStock INTEGER DEFAULT 10,
        minStock INTEGER DEFAULT 5,
        location TEXT,
        lastInboundTime TEXT,
        lastOutboundTime TEXT
      );

      CREATE TABLE IF NOT EXISTS inventory_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partId INTEGER NOT NULL,
        partNo TEXT NOT NULL,
        partName TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        beforeQuantity INTEGER NOT NULL,
        afterQuantity INTEGER NOT NULL,
        operator TEXT NOT NULL,
        reason TEXT,
        relatedOrderNo TEXT,
        createTime TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (partId) REFERENCES inventory(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS weather_forecast (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        forecastDate TEXT UNIQUE NOT NULL,
        temperature REAL DEFAULT 25,
        humidity REAL DEFAULT 60,
        rainfall REAL DEFAULT 0,
        rainfallIntensity TEXT DEFAULT 'light',
        rainfall24h REAL DEFAULT 0,
        windSpeed REAL DEFAULT 0,
        tideLevel REAL,
        updateTime TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pipeline_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        longitude REAL NOT NULL,
        latitude REAL NOT NULL,
        connectedNodes TEXT DEFAULT '[]',
        currentLevel REAL DEFAULT 0,
        maxLevel REAL NOT NULL,
        warningLevel REAL NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_monitoring_pump_time ON monitoring_data(pumpId, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(scheduleDate);
      CREATE INDEX IF NOT EXISTS idx_alerts_unacknowledged ON alerts(acknowledged);
    `);
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS alert_disposal_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          alertId INTEGER NOT NULL,
          action TEXT NOT NULL,
          operator TEXT NOT NULL,
          assignee TEXT,
          progress TEXT DEFAULT 'pending',
          remark TEXT,
          createTime TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (alertId) REFERENCES alerts(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_disposal_alert ON alert_disposal_records(alertId);
      `);
    } catch (e) {
      console.warn("创建处置记录表跳过:", e);
    }
    this.migrate();
  }
  migrate() {
    try {
      const cols = this.db.prepare("PRAGMA table_info(alerts)").all();
      const colNames = cols.map((c) => c.name);
      if (!colNames.includes("autoAction")) {
        this.db.prepare("ALTER TABLE alerts ADD COLUMN autoAction TEXT").run();
      }
      if (!colNames.includes("autoActionResult")) {
        this.db.prepare("ALTER TABLE alerts ADD COLUMN autoActionResult TEXT").run();
      }
      const pumpCount = this.db.prepare("SELECT COUNT(*) as count FROM pumps").get();
      if (pumpCount.count === 0) return;
      const pumps = this.db.prepare("SELECT id, code, name FROM pumps ORDER BY id").all();
      const nodes = this.db.prepare("SELECT id, code, name, type FROM pipeline_nodes WHERE type = ?").all("pump");
      if (nodes.length > 0 && pumps.length > 0) {
        const firstNodeCode = nodes[0].code;
        const firstPumpCode = pumps[0].code;
        if (firstNodeCode !== firstPumpCode && firstNodeCode.startsWith("N")) {
          nodes.forEach((node, idx) => {
            const pump = pumps[idx];
            if (pump) {
              this.db.prepare("UPDATE pipeline_nodes SET code = ?, name = ? WHERE id = ?").run(pump.code, pump.name, node.id);
            }
          });
        }
      }
      const units = this.db.prepare("SELECT id, unitNumber FROM pump_units LIMIT 5").all();
      if (units.length > 0 && units[0].unitNumber.includes("#")) {
        const allUnits = this.db.prepare("SELECT id, unitNumber FROM pump_units").all();
        const updateStmt = this.db.prepare("UPDATE pump_units SET unitNumber = ? WHERE id = ?");
        allUnits.forEach((u) => {
          let newNum = u.unitNumber.replace(/#/g, "");
          if (newNum.endsWith("(备用)")) {
            newNum = newNum.replace("(备用)", "") + "(备用)";
          }
          updateStmt.run(newNum, u.id);
        });
      }
    } catch (e) {
      console.warn("数据库迁移跳过:", e);
    }
  }
  seed() {
    const pumpCount = this.db.prepare("SELECT COUNT(*) as count FROM pumps").get();
    if (pumpCount.count > 0) return;
    const pumps = [
      {
        name: "城东一号泵站",
        code: "CD-001",
        location: "城东新区滨河路88号",
        longitude: 114.3256,
        latitude: 30.5678,
        basin: "东湖流域",
        designFlow: 1200,
        head: 8.5,
        power: 500,
        equipmentModel: "WQ1200-8.5-500",
        manufacturer: "上海水泵厂",
        installDate: "2020-06-15",
        ratedCurrent: 920,
        maxCurrent: 1100,
        forebayWarningLevel: 3.5,
        forebayDangerLevel: 4.2,
        upstreamPumpIds: [],
        downstreamPumpIds: [2, 3]
      },
      {
        name: "城南泵站",
        code: "CD-002",
        location: "城南工业区排水大道",
        longitude: 114.3123,
        latitude: 30.5432,
        basin: "东湖流域",
        designFlow: 800,
        head: 7.2,
        power: 315,
        equipmentModel: "WQ800-7.2-315",
        manufacturer: "上海水泵厂",
        installDate: "2019-03-20",
        ratedCurrent: 580,
        maxCurrent: 700,
        forebayWarningLevel: 3,
        forebayDangerLevel: 3.8,
        upstreamPumpIds: [1],
        downstreamPumpIds: [4]
      },
      {
        name: "城西泵站",
        code: "CD-003",
        location: "城西开发区科技路",
        longitude: 114.289,
        latitude: 30.5612,
        basin: "西湖流域",
        designFlow: 1e3,
        head: 9,
        power: 450,
        equipmentModel: "WQ1000-9-450",
        manufacturer: "长沙水泵厂",
        installDate: "2021-09-10",
        ratedCurrent: 830,
        maxCurrent: 1e3,
        forebayWarningLevel: 3.2,
        forebayDangerLevel: 4,
        upstreamPumpIds: [1],
        downstreamPumpIds: [5]
      },
      {
        name: "城北泵站",
        code: "CD-004",
        location: "城北物流园",
        longitude: 114.3001,
        latitude: 30.5987,
        basin: "东湖流域",
        designFlow: 600,
        head: 6.5,
        power: 220,
        equipmentModel: "WQ600-6.5-220",
        manufacturer: "沈阳水泵厂",
        installDate: "2018-11-05",
        ratedCurrent: 410,
        maxCurrent: 500,
        forebayWarningLevel: 2.8,
        forebayDangerLevel: 3.5,
        upstreamPumpIds: [2],
        downstreamPumpIds: []
      },
      {
        name: "中心枢纽站",
        code: "CD-005",
        location: "市中心人民广场地下",
        longitude: 114.3015,
        latitude: 30.565,
        basin: "西湖流域",
        designFlow: 1500,
        head: 10,
        power: 630,
        equipmentModel: "WQ1500-10-630",
        manufacturer: "上海水泵厂",
        installDate: "2022-01-18",
        ratedCurrent: 1150,
        maxCurrent: 1380,
        forebayWarningLevel: 4,
        forebayDangerLevel: 4.8,
        upstreamPumpIds: [3],
        downstreamPumpIds: []
      }
    ];
    const insertPump = this.db.prepare(`
      INSERT INTO pumps (name, code, location, longitude, latitude, basin, designFlow, head, power,
        equipmentModel, manufacturer, installDate, ratedCurrent, maxCurrent,
        forebayWarningLevel, forebayDangerLevel, upstreamPumpIds, downstreamPumpIds, status,
        lastMaintenanceDate, nextMaintenanceDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertUnit = this.db.prepare(`
      INSERT INTO pump_units (pumpId, unitNumber, equipmentModel, ratedFlow, ratedHead, ratedPower, ratedCurrent, status, isBackup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    pumps.forEach((pump, idx) => {
      const result = insertPump.run(
        pump.name,
        pump.code,
        pump.location,
        pump.longitude,
        pump.latitude,
        pump.basin,
        pump.designFlow,
        pump.head,
        pump.power,
        pump.equipmentModel,
        pump.manufacturer,
        pump.installDate,
        pump.ratedCurrent,
        pump.maxCurrent,
        pump.forebayWarningLevel,
        pump.forebayDangerLevel,
        JSON.stringify(pump.upstreamPumpIds),
        JSON.stringify(pump.downstreamPumpIds),
        "standby",
        dayjs().subtract(1, "month").format("YYYY-MM-DD"),
        dayjs().add(2, "month").format("YYYY-MM-DD")
      );
      const pumpId = result.lastInsertRowid;
      const unitCount = idx === 4 ? 4 : 3;
      for (let i = 1; i <= unitCount; i++) {
        const isBackup = i === unitCount;
        const unitFlow = pump.designFlow / (unitCount - (isBackup ? 1 : 0));
        const unitPower = pump.power / (unitCount - (isBackup ? 1 : 0));
        const unitCurrent = pump.ratedCurrent / (unitCount - (isBackup ? 1 : 0));
        insertUnit.run(
          pumpId,
          isBackup ? `${i}(备用)` : `${i}`,
          pump.equipmentModel,
          unitFlow,
          pump.head,
          unitPower,
          unitCurrent,
          i === 1 ? "running" : "standby",
          isBackup ? 1 : 0
        );
      }
    });
    const insertWeather = this.db.prepare(`
      INSERT INTO weather_forecast (forecastDate, temperature, humidity, rainfall, rainfallIntensity, rainfall24h, windSpeed, tideLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 0; i < 7; i++) {
      const date = dayjs().add(i, "day").format("YYYY-MM-DD");
      const rainfall = i < 2 ? 45 + Math.random() * 20 : Math.random() * 10;
      insertWeather.run(
        date,
        25 + Math.random() * 8,
        60 + Math.random() * 30,
        rainfall,
        rainfall > 30 ? rainfall > 50 ? "storm" : "heavy" : rainfall > 10 ? "moderate" : "light",
        rainfall * 1.2,
        2 + Math.random() * 5,
        1.5 + Math.sin(i * 0.5) * 0.8
      );
    }
    const pipelineNodes = [
      { code: "CD-001", name: "城东一号泵站", type: "pump", longitude: 114.3256, latitude: 30.5678, connected: [2, 3], maxLevel: 5, warningLevel: 3.5 },
      { code: "N002", name: "城南干线节点1", type: "manhole", longitude: 114.32, latitude: 30.555, connected: [1, 4], maxLevel: 4.5, warningLevel: 3 },
      { code: "N003", name: "城西干线节点1", type: "manhole", longitude: 114.305, latitude: 30.565, connected: [1, 5], maxLevel: 4.8, warningLevel: 3.2 },
      { code: "CD-002", name: "城南泵站", type: "pump", longitude: 114.3123, latitude: 30.5432, connected: [2, 6], maxLevel: 4.2, warningLevel: 2.8 },
      { code: "CD-003", name: "城西泵站", type: "pump", longitude: 114.289, latitude: 30.5612, connected: [3, 7], maxLevel: 4.5, warningLevel: 3 },
      { code: "CD-004", name: "城北泵站", type: "pump", longitude: 114.3001, latitude: 30.5987, connected: [4, 8], maxLevel: 4, warningLevel: 2.7 },
      { code: "N007", name: "中心泵站入口", type: "manhole", longitude: 114.295, latitude: 30.563, connected: [5, 9], maxLevel: 5, warningLevel: 3.5 },
      { code: "N008", name: "东北排水主干", type: "manhole", longitude: 114.31, latitude: 30.58, connected: [6, 9], maxLevel: 4.8, warningLevel: 3.3 },
      { code: "CD-005", name: "中心枢纽站", type: "pump", longitude: 114.3015, latitude: 30.565, connected: [7, 8, 10], maxLevel: 5.5, warningLevel: 3.8 },
      { code: "N010", name: "长江排放口", type: "outfall", longitude: 114.33, latitude: 30.55, connected: [9], maxLevel: 6, warningLevel: 4 }
    ];
    const insertNode = this.db.prepare(`
      INSERT INTO pipeline_nodes (code, name, type, longitude, latitude, connectedNodes, currentLevel, maxLevel, warningLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    pipelineNodes.forEach((node) => {
      insertNode.run(
        node.code,
        node.name,
        node.type,
        node.longitude,
        node.latitude,
        JSON.stringify(node.connected),
        1.5 + Math.random() * 1,
        node.maxLevel,
        node.warningLevel
      );
    });
    const inventoryItems = [
      { partNo: "SP-001", partName: "机械密封件", specification: "WQ-500型", unit: "套", quantity: 25, safeStock: 20, minStock: 10, location: "A-01-01" },
      { partNo: "SP-002", partName: "轴承", specification: "6315-2RS", unit: "个", quantity: 18, safeStock: 15, minStock: 8, location: "A-02-03" },
      { partNo: "SP-003", partName: "叶轮", specification: "WQ1200-8.5", unit: "个", quantity: 8, safeStock: 10, minStock: 5, location: "B-01-02" },
      { partNo: "SP-004", partName: "润滑油", specification: "46#抗磨液压油", unit: "桶", quantity: 12, safeStock: 10, minStock: 5, location: "C-01-01" },
      { partNo: "EL-001", partName: "电流传感器", specification: "ACT-1000", unit: "个", quantity: 6, safeStock: 8, minStock: 4, location: "D-01-01" },
      { partNo: "EL-002", partName: "液位变送器", specification: "LT-2000", unit: "台", quantity: 4, safeStock: 6, minStock: 3, location: "D-02-01" },
      { partNo: "EL-003", partName: "PLC模块", specification: "S7-300", unit: "块", quantity: 3, safeStock: 5, minStock: 2, location: "D-03-01" }
    ];
    const insertInventory = this.db.prepare(`
      INSERT INTO inventory (partNo, partName, specification, unit, quantity, safeStock, minStock, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    inventoryItems.forEach((item) => {
      insertInventory.run(item.partNo, item.partName, item.specification, item.unit, item.quantity, item.safeStock, item.minStock, item.location);
    });
    const now = dayjs();
    for (let i = 0; i < 288; i++) {
      const timestamp = now.subtract((288 - i) * 5, "minute").format("YYYY-MM-DD HH:mm:ss");
      for (let p = 1; p <= 5; p++) {
        const pump = this.getPump(p);
        if (!pump) continue;
        const isRunning = Math.random() > 0.3;
        this.db.prepare(`
          INSERT INTO monitoring_data (pumpId, timestamp, current, flow, head, forebayLevel, vibration, temperature, isAlert, alertLevel)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          p,
          timestamp,
          isRunning ? pump.ratedCurrent * (0.7 + Math.random() * 0.35) : 2 + Math.random() * 3,
          isRunning ? pump.designFlow * 0.6 * (0.85 + Math.random() * 0.3) : 0,
          pump.head * (0.9 + Math.random() * 0.2),
          1.5 + Math.sin(i * 0.1) * 1.2 + Math.random() * 0.3,
          1.5 + Math.random() * 2,
          25 + Math.random() * 15,
          0,
          null
        );
      }
    }
  }
  enrichUnits(units, pump) {
    return units.map((u) => {
      let flow = 0;
      let current = 0;
      let head = pump.head;
      if (u.status === "running") {
        flow = Math.round(u.ratedFlow * (0.85 + Math.random() * 0.1));
        current = +(u.ratedCurrent * (0.85 + Math.random() * 0.1)).toFixed(1);
        head = +(u.ratedHead * (0.95 + Math.random() * 0.08)).toFixed(1);
      }
      return {
        ...u,
        isBackup: !!u.isBackup,
        current,
        flow,
        head
      };
    });
  }
  getPumps() {
    const pumps = this.db.prepare("SELECT * FROM pumps ORDER BY id").all().map((p) => ({
      ...p,
      upstreamPumpIds: JSON.parse(p.upstreamPumpIds || "[]"),
      downstreamPumpIds: JSON.parse(p.downstreamPumpIds || "[]")
    }));
    pumps.forEach((pump) => {
      const units = this.db.prepare("SELECT * FROM pump_units WHERE pumpId = ? ORDER BY id").all(pump.id);
      pump.units = this.enrichUnits(units, pump);
    });
    return pumps;
  }
  getPump(id) {
    const pump = this.db.prepare("SELECT * FROM pumps WHERE id = ?").get(id);
    if (!pump) return null;
    const units = this.db.prepare("SELECT * FROM pump_units WHERE pumpId = ? ORDER BY id").all(id);
    return {
      ...pump,
      upstreamPumpIds: JSON.parse(pump.upstreamPumpIds || "[]"),
      downstreamPumpIds: JSON.parse(pump.downstreamPumpIds || "[]"),
      units: this.enrichUnits(units, pump)
    };
  }
  createPump(data) {
    const result = this.db.prepare(`
      INSERT INTO pumps (name, code, location, longitude, latitude, basin, designFlow, head, power,
        equipmentModel, manufacturer, installDate, ratedCurrent, maxCurrent,
        forebayWarningLevel, forebayDangerLevel, upstreamPumpIds, downstreamPumpIds, status,
        lastMaintenanceDate, nextMaintenanceDate, updateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      data.name,
      data.code,
      data.location,
      data.longitude,
      data.latitude,
      data.basin,
      data.designFlow,
      data.head,
      data.power,
      data.equipmentModel,
      data.manufacturer,
      data.installDate,
      data.ratedCurrent,
      data.maxCurrent,
      data.forebayWarningLevel,
      data.forebayDangerLevel,
      JSON.stringify(data.upstreamPumpIds || []),
      JSON.stringify(data.downstreamPumpIds || []),
      data.status || "standby",
      data.lastMaintenanceDate,
      data.nextMaintenanceDate
    );
    return result.lastInsertRowid;
  }
  updatePump(id, data) {
    this.db.prepare(`
      UPDATE pumps SET name = ?, code = ?, location = ?, longitude = ?, latitude = ?, basin = ?,
        designFlow = ?, head = ?, power = ?, equipmentModel = ?, manufacturer = ?, installDate = ?,
        ratedCurrent = ?, maxCurrent = ?, forebayWarningLevel = ?, forebayDangerLevel = ?,
        upstreamPumpIds = ?, downstreamPumpIds = ?, status = ?, updateTime = datetime('now')
      WHERE id = ?
    `).run(
      data.name,
      data.code,
      data.location,
      data.longitude,
      data.latitude,
      data.basin,
      data.designFlow,
      data.head,
      data.power,
      data.equipmentModel,
      data.manufacturer,
      data.installDate,
      data.ratedCurrent,
      data.maxCurrent,
      data.forebayWarningLevel,
      data.forebayDangerLevel,
      JSON.stringify(data.upstreamPumpIds || []),
      JSON.stringify(data.downstreamPumpIds || []),
      data.status,
      id
    );
  }
  deletePump(id) {
    this.db.prepare("DELETE FROM pumps WHERE id = ?").run(id);
  }
  getSchedules() {
    return this.db.prepare("SELECT * FROM schedules ORDER BY scheduleDate DESC, id DESC").all().map((s) => ({
      ...s,
      operatingUnits: JSON.parse(s.operatingUnits || "[]")
    }));
  }
  getSchedule(id) {
    const schedule = this.db.prepare("SELECT * FROM schedules WHERE id = ?").get(id);
    if (!schedule) return null;
    return {
      ...schedule,
      operatingUnits: JSON.parse(schedule.operatingUnits || "[]")
    };
  }
  createSchedule(data) {
    const result = this.db.prepare(`
      INSERT INTO schedules (scheduleDate, pumpId, pumpName, planStartTime, planEndTime,
        plannedFlow, operatingUnits, reason, constraints, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.scheduleDate,
      data.pumpId,
      data.pumpName,
      data.planStartTime,
      data.planEndTime,
      data.plannedFlow,
      JSON.stringify(data.operatingUnits || []),
      data.reason,
      data.constraints,
      data.status || "pending_approval"
    );
    return result.lastInsertRowid;
  }
  updateSchedule(id, data) {
    this.db.prepare(`
      UPDATE schedules SET scheduleDate = ?, pumpId = ?, pumpName = ?, planStartTime = ?,
        planEndTime = ?, plannedFlow = ?, operatingUnits = ?, reason = ?, constraints = ?,
        status = ?, updateTime = datetime('now')
      WHERE id = ?
    `).run(
      data.scheduleDate,
      data.pumpId,
      data.pumpName,
      data.planStartTime,
      data.planEndTime,
      data.plannedFlow,
      JSON.stringify(data.operatingUnits || []),
      data.reason,
      data.constraints,
      data.status,
      id
    );
  }
  approveSchedule(id, approver, comment) {
    this.db.prepare(`
      UPDATE schedules SET status = 'approved', approver = ?, approvalComment = ?,
        approvalTime = datetime('now'), updateTime = datetime('now')
      WHERE id = ?
    `).run(approver, comment, id);
  }
  rejectSchedule(id, approver, reason) {
    this.db.prepare(`
      UPDATE schedules SET status = 'rejected', approver = ?, approvalComment = ?,
        approvalTime = datetime('now'), updateTime = datetime('now')
      WHERE id = ?
    `).run(approver, reason, id);
  }
  confirmSchedule(id, operator) {
    this.db.prepare(`
      UPDATE schedules SET status = 'confirmed', operator = ?, confirmTime = datetime('now'),
        updateTime = datetime('now')
      WHERE id = ?
    `).run(operator, id);
  }
  requestScheduleAdjust(id, operator, reason) {
    this.db.prepare(`
      UPDATE schedules SET status = 'adjust_requested', operator = ?, adjustReason = ?,
        adjustRequestTime = datetime('now'), updateTime = datetime('now')
      WHERE id = ?
    `).run(operator, reason, id);
  }
  getRealtimeMonitoring(pumpId) {
    return this.db.prepare(`
      SELECT * FROM monitoring_data WHERE pumpId = ? ORDER BY timestamp DESC LIMIT 1
    `).get(pumpId);
  }
  getMonitoringHistory(pumpId, start, end) {
    return this.db.prepare(`
      SELECT * FROM monitoring_data
      WHERE pumpId = ? AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `).all(pumpId, start, end);
  }
  insertMonitoring(data) {
    let isAlert = 0;
    let alertLevel = null;
    const pump = this.getPump(data.pumpId);
    if (pump) {
      if (data.current > pump.maxCurrent) {
        isAlert = 1;
        alertLevel = "danger";
        this.insertAlert({
          pumpId: data.pumpId,
          unitId: data.unitId,
          alertType: "过流",
          alertLevel: "danger",
          parameter: "current",
          actualValue: data.current,
          threshold: pump.maxCurrent,
          message: `泵组电流超过最大值: ${data.current.toFixed(1)}A > ${pump.maxCurrent}A`
        });
      } else if (data.current > pump.ratedCurrent) {
        isAlert = 1;
        alertLevel = "warning";
      }
      if (data.forebayLevel > pump.forebayDangerLevel) {
        isAlert = 1;
        alertLevel = "danger";
        this.insertAlert({
          pumpId: data.pumpId,
          unitId: data.unitId,
          alertType: "前池水位过高",
          alertLevel: "critical",
          parameter: "forebayLevel",
          actualValue: data.forebayLevel,
          threshold: pump.forebayDangerLevel,
          message: `前池水位超危险值: ${data.forebayLevel.toFixed(2)}m > ${pump.forebayDangerLevel}m，已自动启动备用泵`
        });
      } else if (data.forebayLevel > pump.forebayWarningLevel) {
        isAlert = 1;
        alertLevel = alertLevel || "warning";
      }
    }
    const result = this.db.prepare(`
      INSERT INTO monitoring_data (pumpId, unitId, current, voltage, flow, head, forebayLevel,
        outletPressure, vibration, temperature, isAlert, alertLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.pumpId,
      data.unitId,
      data.current,
      data.voltage || 380,
      data.flow,
      data.head,
      data.forebayLevel,
      data.outletPressure || 0,
      data.vibration || 0,
      data.temperature || 25,
      isAlert,
      alertLevel
    );
    return result.lastInsertRowid;
  }
  insertAlert(data) {
    const result = this.db.prepare(`
      INSERT INTO alerts (pumpId, unitId, alertType, alertLevel, parameter, actualValue, threshold,
        message, autoAction, autoActionResult)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.pumpId,
      data.unitId,
      data.alertType,
      data.alertLevel,
      data.parameter,
      data.actualValue,
      data.threshold,
      data.message,
      data.autoAction || null,
      data.autoActionResult || null
    );
    return result.lastInsertRowid;
  }
  getAlerts() {
    return this.db.prepare(`
      SELECT * FROM alerts ORDER BY timestamp DESC
    `).all().map((a) => ({
      ...a,
      acknowledged: !!a.acknowledged
    }));
  }
  getActiveAlerts() {
    return this.db.prepare(`
      SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY timestamp DESC
    `).all().map((a) => ({
      ...a,
      acknowledged: !!a.acknowledged
    }));
  }
  acknowledgeAlert(id, operator) {
    this.db.prepare(`
      UPDATE alerts SET acknowledged = 1, acknowledgedBy = ?, acknowledgedTime = datetime('now')
      WHERE id = ?
    `).run(operator, id);
  }
  getMaintenanceOrders() {
    return this.db.prepare(`
      SELECT * FROM maintenance_orders ORDER BY createTime DESC
    `).all().map((o) => ({
      ...o,
      triggerValue: JSON.parse(o.triggerValue || "{}"),
      partsRequired: JSON.parse(o.partsRequired || "[]")
    }));
  }
  createMaintenanceOrder(data) {
    const orderNo = "MO-" + dayjs().format("YYYYMMDD") + "-" + String(Math.floor(Math.random() * 1e4)).padStart(4, "0");
    const result = this.db.prepare(`
      INSERT INTO maintenance_orders (orderNo, pumpId, unitId, type, priority, description,
        triggerReason, triggerValue, assignedTeam, partsRequired, planDate, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNo,
      data.pumpId,
      data.unitId,
      data.type,
      data.priority,
      data.description,
      data.triggerReason,
      JSON.stringify(data.triggerValue || {}),
      data.assignedTeam,
      JSON.stringify(data.partsRequired || []),
      data.planDate,
      data.remark
    );
    return result.lastInsertRowid;
  }
  updateMaintenanceOrder(id, data) {
    this.db.prepare(`
      UPDATE maintenance_orders SET type = ?, priority = ?, description = ?, assignedTeam = ?,
        status = ?, partsRequired = ?, planDate = ?, actualStartDate = ?, actualEndDate = ?, remark = ?
      WHERE id = ?
    `).run(
      data.type,
      data.priority,
      data.description,
      data.assignedTeam,
      data.status,
      JSON.stringify(data.partsRequired || []),
      data.planDate,
      data.actualStartDate,
      data.actualEndDate,
      data.remark,
      id
    );
  }
  generateMaintenanceOrders() {
    const pumps = this.getPumps();
    const generatedIds = [];
    pumps.forEach((pump) => {
      const runtimeThreshold = 2e3;
      const startCountThreshold = 500;
      const needsMaintenance = pump.totalRuntime >= runtimeThreshold || pump.startCount >= startCountThreshold;
      if (needsMaintenance) {
        const triggerReason = [];
        const triggerValue = {};
        if (pump.totalRuntime >= runtimeThreshold) {
          triggerReason.push(`运行时长达到阈值: ${pump.totalRuntime}h`);
          triggerValue.runtime = pump.totalRuntime;
        }
        if (pump.startCount >= startCountThreshold) {
          triggerReason.push(`启停次数达到阈值: ${pump.startCount}次`);
          triggerValue.startCount = pump.startCount;
        }
        const id = this.createMaintenanceOrder({
          pumpId: pump.id,
          type: "preventive",
          priority: "medium",
          description: `泵站【${pump.name}】预防性维护`,
          triggerReason: triggerReason.join("；"),
          triggerValue,
          assignedTeam: "维修一班",
          partsRequired: [
            { partId: 1, partName: "机械密封件", quantity: 1 },
            { partId: 2, partName: "轴承", quantity: 2 }
          ],
          planDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
          remark: "按规程进行全面检查维护"
        });
        generatedIds.push(id);
        this.db.prepare("UPDATE pumps SET totalRuntime = 0, startCount = 0, lastMaintenanceDate = date('now'), nextMaintenanceDate = date('now', '+3 months') WHERE id = ?").run(pump.id);
      }
    });
    return generatedIds;
  }
  getInventory() {
    return this.db.prepare("SELECT * FROM inventory ORDER BY id").all();
  }
  updateInventory(id, data) {
    this.db.prepare(`
      UPDATE inventory SET partName = ?, specification = ?, unit = ?, quantity = ?,
        safeStock = ?, minStock = ?, location = ?
      WHERE id = ?
    `).run(data.partName, data.specification, data.unit, data.quantity, data.safeStock, data.minStock, data.location, id);
  }
  deductInventory(partId, quantity, operator = "系统", reason = "维保工单扣减", orderNo) {
    const item = this.db.prepare("SELECT * FROM inventory WHERE id = ?").get(partId);
    if (!item || item.quantity < quantity) return false;
    const beforeQuantity = item.quantity;
    const afterQuantity = item.quantity - quantity;
    this.db.prepare(`
      UPDATE inventory SET quantity = quantity - ?, lastOutboundTime = datetime('now') WHERE id = ?
    `).run(quantity, partId);
    this.db.prepare(`
      INSERT INTO inventory_records (partId, partNo, partName, type, quantity, beforeQuantity, afterQuantity, operator, reason, relatedOrderNo)
      VALUES (?, ?, ?, 'outbound', ?, ?, ?, ?, ?, ?)
    `).run(partId, item.partNo, item.partName, quantity, beforeQuantity, afterQuantity, operator, reason, orderNo || null);
    return true;
  }
  inboundInventory(partId, quantity, operator, reason) {
    const item = this.db.prepare("SELECT * FROM inventory WHERE id = ?").get(partId);
    if (!item) return false;
    const beforeQuantity = item.quantity;
    const afterQuantity = item.quantity + quantity;
    this.db.prepare(`
      UPDATE inventory SET quantity = quantity + ?, lastInboundTime = datetime('now') WHERE id = ?
    `).run(quantity, partId);
    this.db.prepare(`
      INSERT INTO inventory_records (partId, partNo, partName, type, quantity, beforeQuantity, afterQuantity, operator, reason)
      VALUES (?, ?, ?, 'inbound', ?, ?, ?, ?, ?)
    `).run(partId, item.partNo, item.partName, quantity, beforeQuantity, afterQuantity, operator, reason);
    return true;
  }
  outboundInventory(partId, quantity, operator, reason) {
    return this.deductInventory(partId, quantity, operator, reason);
  }
  getInventoryRecords(partId) {
    if (partId) {
      return this.db.prepare(`
        SELECT * FROM inventory_records WHERE partId = ? ORDER BY createTime DESC LIMIT 100
      `).all(partId);
    }
    return this.db.prepare(`
      SELECT * FROM inventory_records ORDER BY createTime DESC LIMIT 200
    `).all();
  }
  getLowStockItems() {
    return this.db.prepare(`
      SELECT * FROM inventory WHERE quantity < safeStock ORDER BY quantity ASC
    `).all();
  }
  getStatisticsSummary(start, end) {
    const result = this.db.prepare(`
      SELECT
        COUNT(DISTINCT pumpId) as pumpCount,
        SUM(flow) * 5 / 60 as totalDischarge,
        AVG(flow) as avgFlow,
        COUNT(*) as dataPoints,
        SUM(CASE WHEN isAlert = 1 THEN 1 ELSE 0 END) as alertCount
      FROM monitoring_data
      WHERE timestamp BETWEEN ? AND ?
    `).get(start, end);
    const alertStats = this.db.prepare(`
      SELECT alertLevel, COUNT(*) as count FROM alerts
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY alertLevel
    `).all(start, end);
    return { ...result || {}, alertBreakdown: alertStats };
  }
  getPumpStatistics(pumpId, start, end) {
    const pump = this.getPump(pumpId);
    if (!pump) return null;
    const data = this.db.prepare(`
      SELECT
        SUM(flow) * 5 / 60 as totalDischarge,
        AVG(flow) as avgFlow,
        MAX(flow) as maxFlow,
        AVG(current) as avgCurrent,
        AVG(head) as avgHead,
        SUM(CASE WHEN flow > 0 THEN 1 ELSE 0 END) * 5 / 60 as runtime,
        SUM(CASE WHEN isAlert = 1 THEN 1 ELSE 0 END) as alertCount,
        AVG(forebayLevel) as avgForebayLevel
      FROM monitoring_data
      WHERE pumpId = ? AND timestamp BETWEEN ? AND ?
    `).get(pumpId, start, end);
    const powerConsumption = data.runtime * pump.power;
    const unitEnergy = data.totalDischarge > 0 ? powerConsumption / data.totalDischarge * 1e3 : 0;
    const faultCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM alerts
      WHERE pumpId = ? AND alertLevel IN ('danger', 'critical') AND timestamp BETWEEN ? AND ?
    `).get(pumpId, start, end).count;
    return {
      pumpId,
      pumpName: pump.name,
      basin: pump.basin,
      ...data || {},
      totalPowerConsumption: powerConsumption,
      unitEnergyConsumption: unitEnergy,
      equipmentAvailability: 100,
      faultCount
    };
  }
  getBasinStatistics(start, end) {
    const pumps = this.getPumps();
    const basins = [...new Set(pumps.map((p) => p.basin))];
    return basins.map((basin) => {
      const basinPumps = pumps.filter((p) => p.basin === basin);
      let totalDischarge = 0;
      let totalRuntime = 0;
      let totalPower = 0;
      let totalFaults = 0;
      let totalAlerts = 0;
      basinPumps.forEach((pump) => {
        const stats = this.getPumpStatistics(pump.id, start, end);
        if (stats) {
          totalDischarge += stats.totalDischarge || 0;
          totalRuntime += stats.runtime || 0;
          totalPower += stats.totalPowerConsumption || 0;
          totalFaults += stats.faultCount || 0;
          totalAlerts += stats.alertCount || 0;
        }
      });
      return {
        basin,
        pumpCount: basinPumps.length,
        totalDischarge,
        totalRuntime,
        totalPowerConsumption: totalPower,
        unitEnergyConsumption: totalDischarge > 0 ? totalPower / totalDischarge * 1e3 : 0,
        equipmentAvailability: 100,
        faultCount: totalFaults,
        alertCount: totalAlerts
      };
    });
  }
  getWeatherForecast() {
    return this.db.prepare("SELECT * FROM weather_forecast ORDER BY forecastDate").all();
  }
  updateWeatherForecast(data) {
    const stmt = this.db.prepare(`
      INSERT INTO weather_forecast (forecastDate, temperature, humidity, rainfall, rainfallIntensity, rainfall24h, windSpeed, tideLevel, updateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(forecastDate) DO UPDATE SET
        temperature = excluded.temperature,
        humidity = excluded.humidity,
        rainfall = excluded.rainfall,
        rainfallIntensity = excluded.rainfallIntensity,
        rainfall24h = excluded.rainfall24h,
        windSpeed = excluded.windSpeed,
        tideLevel = excluded.tideLevel,
        updateTime = datetime('now')
    `);
    const tx = this.db.transaction((items) => {
      items.forEach((item) => {
        stmt.run(
          item.forecastDate,
          item.temperature,
          item.humidity,
          item.rainfall,
          item.rainfallIntensity,
          item.rainfall24h,
          item.windSpeed,
          item.tideLevel
        );
      });
    });
    tx(data);
  }
  getPipelineNetworkLevels() {
    return this.db.prepare("SELECT * FROM pipeline_nodes ORDER BY id").all().map((n) => ({
      ...n,
      connectedNodes: JSON.parse(n.connectedNodes || "[]")
    }));
  }
  getDisposalRecords(alertId) {
    return this.db.prepare(`
      SELECT * FROM alert_disposal_records WHERE alertId = ? ORDER BY createTime ASC
    `).all(alertId);
  }
  addDisposalRecord(data) {
    const result = this.db.prepare(`
      INSERT INTO alert_disposal_records (alertId, action, operator, assignee, progress, remark)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.alertId,
      data.action,
      data.operator,
      data.assignee || null,
      data.progress || "pending",
      data.remark || null
    );
    return result.lastInsertRowid;
  }
  updateDisposalRecord(id, data) {
    this.db.prepare(`
      UPDATE alert_disposal_records SET progress = ?, remark = ?, assignee = ?
      WHERE id = ?
    `).run(data.progress, data.remark, data.assignee, id);
  }
  close() {
    this.db.close();
  }
}
let mainWindow = null;
let db;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 768,
    title: "城市排水防涝与泵站智能调度系统",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(() => {
  db = new PumpDatabase();
  db.init();
  db.seed();
  createWindow();
  registerIpcHandlers();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    db.close();
    electron.app.quit();
  }
});
function registerIpcHandlers() {
  electron.ipcMain.handle("pump:list", () => db.getPumps());
  electron.ipcMain.handle("pump:get", (_e, id) => db.getPump(id));
  electron.ipcMain.handle("pump:create", (_e, data) => db.createPump(data));
  electron.ipcMain.handle("pump:update", (_e, id, data) => db.updatePump(id, data));
  electron.ipcMain.handle("pump:delete", (_e, id) => db.deletePump(id));
  electron.ipcMain.handle("schedule:list", () => db.getSchedules());
  electron.ipcMain.handle("schedule:get", (_e, id) => db.getSchedule(id));
  electron.ipcMain.handle("schedule:create", (_e, data) => db.createSchedule(data));
  electron.ipcMain.handle("schedule:update", (_e, id, data) => db.updateSchedule(id, data));
  electron.ipcMain.handle("schedule:approve", (_e, id, approver, comment) => db.approveSchedule(id, approver, comment));
  electron.ipcMain.handle("schedule:reject", (_e, id, approver, reason) => db.rejectSchedule(id, approver, reason));
  electron.ipcMain.handle("schedule:confirm", (_e, id, operator) => db.confirmSchedule(id, operator));
  electron.ipcMain.handle("schedule:requestAdjust", (_e, id, operator, reason) => db.requestScheduleAdjust(id, operator, reason));
  electron.ipcMain.handle("monitoring:realtime", (_e, pumpId) => db.getRealtimeMonitoring(pumpId));
  electron.ipcMain.handle("monitoring:history", (_e, pumpId, start, end) => db.getMonitoringHistory(pumpId, start, end));
  electron.ipcMain.handle("monitoring:insert", (_e, data) => db.insertMonitoring(data));
  electron.ipcMain.handle("monitoring:alerts", () => db.getAlerts());
  electron.ipcMain.handle("monitoring:alert:insert", (_e, alert) => db.insertAlert(alert));
  electron.ipcMain.handle("monitoring:alert:ack", (_e, id, operator) => db.acknowledgeAlert(id, operator));
  electron.ipcMain.handle("monitoring:disposal:list", (_e, alertId) => db.getDisposalRecords(alertId));
  electron.ipcMain.handle("monitoring:disposal:add", (_e, data) => db.addDisposalRecord(data));
  electron.ipcMain.handle("monitoring:disposal:update", (_e, id, data) => db.updateDisposalRecord(id, data));
  electron.ipcMain.handle("maintenance:list", () => db.getMaintenanceOrders());
  electron.ipcMain.handle("maintenance:create", (_e, data) => db.createMaintenanceOrder(data));
  electron.ipcMain.handle("maintenance:update", (_e, id, data) => db.updateMaintenanceOrder(id, data));
  electron.ipcMain.handle("maintenance:generate", () => db.generateMaintenanceOrders());
  electron.ipcMain.handle("inventory:list", () => db.getInventory());
  electron.ipcMain.handle("inventory:update", (_e, id, data) => db.updateInventory(id, data));
  electron.ipcMain.handle("inventory:deduct", (_e, partId, quantity, operator, reason, orderNo) => db.deductInventory(partId, quantity, operator, reason, orderNo));
  electron.ipcMain.handle("inventory:inbound", (_e, partId, quantity, operator, reason) => db.inboundInventory(partId, quantity, operator, reason));
  electron.ipcMain.handle("inventory:outbound", (_e, partId, quantity, operator, reason) => db.outboundInventory(partId, quantity, operator, reason));
  electron.ipcMain.handle("inventory:records", (_e, partId) => db.getInventoryRecords(partId));
  electron.ipcMain.handle("inventory:lowStock", () => db.getLowStockItems());
  electron.ipcMain.handle("statistics:summary", (_e, start, end) => db.getStatisticsSummary(start, end));
  electron.ipcMain.handle("statistics:byPump", (_e, pumpId, start, end) => db.getPumpStatistics(pumpId, start, end));
  electron.ipcMain.handle("statistics:byBasin", (_e, start, end) => db.getBasinStatistics(start, end));
  electron.ipcMain.handle("weather:forecast", () => db.getWeatherForecast());
  electron.ipcMain.handle("weather:update", (_e, data) => db.updateWeatherForecast(data));
  electron.ipcMain.handle("pipelinenetwork:levels", () => db.getPipelineNetworkLevels());
  electron.ipcMain.handle("dialog:save", async (_e, defaultName) => {
    const result = await electron.dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: "PDF Files", extensions: ["pdf"] }]
    });
    return result.filePath;
  });
}
