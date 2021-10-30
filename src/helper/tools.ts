function debounce(fun: any, delay: number, ctx?: any) {
  return (...args: any): void => {
    const context = ctx || {};
    clearTimeout(fun.id);
    fun.id = setTimeout(() => {
      fun.apply(context, args);
    }, delay);
  };
}

export { debounce };
