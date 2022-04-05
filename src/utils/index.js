export function extractIdByUrl(url) {
  const id = url.split("/")[5]
  return id
}

export async function delay() {
  return await new Promise((resolver, reject) => {
    setTimeout(resolver, 2000);
  });
}
