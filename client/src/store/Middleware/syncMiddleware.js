export const syncMiddleware = (store) => {
  let actionQueue = [];
  let isProcessing = false;

  const processQueue = () => {
    if (actionQueue.length === 0) {
      isProcessing = false;
      return;
    }

    isProcessing = true;
    const { action, next } = actionQueue.shift();

    if (typeof action === 'function') {
        return new Promise((resolve, reject) => {
          action(store.dispatch, store.getState).then((result) => {
            resolve(result);
          }).catch((error) => {
            // Handle errors, e.g., dispatch an error action or log the error
            console.error('Thunk error:', error);
            reject(error);
          });
        }).then((result) => {
          // Dispatch the result asynchronously to avoid blocking the main thread
          setTimeout(() => {
            next(result);
          }, 0);
        });
      } else {
        return next(action);
      }
  };

  return (next) => (action) => {
      actionQueue.push({ action, next });
      if (!isProcessing) {
        processQueue();
      }
  };
};
