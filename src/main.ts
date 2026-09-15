const input = document.querySelector<HTMLInputElement>("#input-url");
const status = document.querySelector<HTMLParagraphElement>("#status");

if (!input || !status) {
  throw new Error("Required DOM elements not found");
}

type urlType = 'URL'| 'FOLDER' | 'FILE';

interface Reponse{
  exists: boolean,
  type?: urlType
}


const mockData : Record<string, urlType> = {
"https://example.com": 'URL',
"https://example.com/images/": 'FOLDER',
"https://example.com/images/photo.jpg": 'FILE',
}


function isValid(value: string): boolean {
  if (!URL.canParse(value)) {
    return false;
  }

  const url = new URL(value);

  return url.protocol === "http:" || url.protocol === "https:";
}

function checkURLOnServer(url: string): Promise<Reponse> {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 600) + 200;

    setTimeout(() => {
      const checkUrl = mockData[url];

      if (!checkUrl) {
        resolve({
          exists: false
        });
        return;
      }

      resolve({
        exists: true,
        type: checkUrl
      });
    }, delay);
  });
}

const debounce = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  let timeoutId: number | undefined;

  return (...args: any[]) => {
    window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

const debouncedCheck = debounce(async (url: string) => {
  const result = await checkURLOnServer(url);
  if(!result.exists){
    status.textContent = "URL does not exists";
    return;
  }
 if(result.type === 'URL'){
   status.textContent = "URL exists";
    return;
 }

  status.textContent = `URL exists and the type is ${result.type}`;
}, 500);


input.addEventListener("input", () => {
  const url = input.value.trim();
  if(!url){
    status.textContent = ""
    return;
  }
  if(!isValid(url)){

    status.textContent = "Invalid URL"
    return;

  }

  status.textContent = "Valid URL"

debouncedCheck(url);
  
})