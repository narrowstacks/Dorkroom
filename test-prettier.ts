// Test file for prettier formatting
const badlyFormatted = {
  message: "this should be reformatted",
  className: "bg-red-500 text-white p-4 rounded-lg shadow-md hover:bg-red-600",
};

function poorlySpaced(x: number, y: string) {
  return `${x}-${y}`;
}

export default badlyFormatted;
