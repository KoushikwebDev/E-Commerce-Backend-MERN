const p = "gte gte lte";

console.log(p.replaceAll("gte", "$gte"));

const regex = /\b(gte|lte)\b/g;
console.log(p.replace(regex, (m) => `$${m}`));

// "$gte $gte lte"
//  "$gte $gte $lte"
