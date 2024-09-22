export const debounce = (fn: (_id: string, text: string) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (_id: string, text: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(_id, text), delay);
  };
};