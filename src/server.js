import app from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server runing in port ${port}`);
});
