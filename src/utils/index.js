export default function extractIdByUrl(url) {
  const id = url.split('/')[5];
  return id;
}
