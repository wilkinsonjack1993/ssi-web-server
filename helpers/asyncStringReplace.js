// This method was taken from: https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9
const asyncStringReplace = async (str, regex, asynchronousFunction) => {
  const substrs = [];
  let match;
  let i = 0;
  while ((match = regex.exec(str)) !== null) {
    // put non matching string
    substrs.push(str.slice(i, match.index));
    // call the async replacer function with the matched array spreaded
    substrs.push(asynchronousFunction(...match));
    i = regex.lastIndex;
  }
  // put the rest of str
  substrs.push(str.slice(i));
  // wait for asynchronousFunction calls to finish and join them back into string
  return (await Promise.all(substrs)).join("");
};

module.exports = {
  asyncStringReplace,
};
