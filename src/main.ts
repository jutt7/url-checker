const input = document.querySelector<HTMLInputElement>("#input-url");
const status = document.querySelector<HTMLParagraphElement>("#status");

let currentController: AbortController | null = null;

if (!input || !status) {
  throw new Error("Required DOM elements not found");
}

type urlType = 'URL'| 'FOLDER' | 'FILE';

interface Reponse {
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

function requestURLCheck(url: string, signal: AbortSignal ): Promise<Reponse> {
  return new Promise((resolve, reject) => {

    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    signal.addEventListener("abort",() => reject(signal.reason),
      { once: true }
    );

    checkURLOnServer(url)
      .then(resolve)
      .catch(reject);
  });
}

const debouncedCheck = debounce(async (url: string, signal: AbortSignal) => {
  try{
      const result = await requestURLCheck(url, signal);
  if(!result.exists){
    status.textContent = "URL does not exists";
    return;
  }
 if(result.type === 'URL'){
   status.textContent = "URL exists";
    return;
 }

  status.textContent = `URL exists and the type is ${result.type}`;
  }
  catch (error) {
  if (signal.aborted) return;
  console.error(error);
}

}, 500);


input.addEventListener("input", () => {

  currentController?.abort();

  const url = input.value.trim();
  if(!url){
    status.textContent = ""
    return;
  }
  if(!isValid(url)){

    status.textContent = "Invalid URL"
    return;

  }

  currentController = new AbortController();  

  status.textContent = "Valid URL"

  debouncedCheck(url, currentController.signal);
  
})