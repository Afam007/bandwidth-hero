import fetch from 'node-fetch'
const pick = require("../util/pick"),
  shouldCompress = require("../util/shouldCompress"),
  compress = require("../util/compress"),
  DEFAULT_QUALITY = 40;
exports.handler = async (e, t) => {
  let { url: r } = e.queryStringParameters,
    { jpeg: s, bw: o, l: a } = e.queryStringParameters;
  let { exp: ex } = e.queryStringParameters;
  if (!r)
    return { statusCode: 200, body: "Bandwidth Hero Data Compression Service" };
  try {
    r = JSON.parse(r);
    r = r + "&exp" + ex;
  } catch {}
  Array.isArray(r) && (r = r.join("&url=")),
    (r = r.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, "http://"));
  let d = !s,
    n = 0 != o,
    i = parseInt(a, 10) || 40;
  try {
    let h = {},
      { data: c, type: l } = await fetch(r, {
        headers: {
          ...pick(e.headers, ["cookie", "dnt", "referer"]),
          "user-agent": "Bandwidth-Hero Compressor",
          "x-forwarded-for": e.headers["x-forwarded-for"] || e.ip,
          via: "1.1 bandwidth-hero",
        },
      }).then(async (e) =>
        e.ok
          ? ((h = e.headers),
            {
              data: await e.buffer(),
              type: e.headers.get("content-type") || "",
            })
          : { statusCode: e.status || 302 },
      ),
      p = c.length;
    if (!shouldCompress(l, p, d))
      return (
        console.log("Bypassing... Size: ", c.length),
        {
          statusCode: 200,
          body: c.toString("base64"),
          isBase64Encoded: !0,
          headers: { "content-encoding": "identity", ...h },
        }
      );
    {
      let { err: u, output: y, headers: g } = await compress(c, d, n, i, p);
      if (u) throw (console.log("Conversion failed: ", r), u);
      console.log(`From ${p}, Saved: ${(p - y.length) / p}%`);
      let $ = y.toString("base64");
      return {
        statusCode: 200,
        body: $,
        isBase64Encoded: !0,
        headers: { "content-encoding": "identity", ...h, ...g },
      };
    }
  } catch (f) {
    return console.error(f), { statusCode: 500, body: f.message || "" };
  }
};
