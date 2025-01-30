const parseBoolean = (bool) => {
    if (bool === 'true') return true;
    if (bool === 'false') return false;
    return undefined;
  };
  
  export const parseContactsFilterParams = ({isFavourite}) => {
    const parsedIsFavourite = parseBoolean(isFavourite);

    return {isFavourite: parsedIsFavourite};
};