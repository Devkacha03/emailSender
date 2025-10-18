import validator from "validator";
let data =
  "   devkacha90@gmail.com,devkacha90@outlook.com,devkacha90@gmail.com,devkacha90@outlook.co";

if (data && data.trim()) {
  let result = data
    .split(",")
    .filter((e) => e && typeof e === "string")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => validator.isEmail(e));

  console.log([...new Set(result)]);
}
