

const sortOrderList = ["asc", "desc"];

export const parseSortParams = ({sortBy, sortOrder}) => {

    const sortByList = ["name", "email", "phone", "isFavourite"];
const parsedSortOrder = sortOrderList.includes(sortOrder) ? sortOrder : sortOrderList[0];
const parsedSortBy = sortByList.includes(sortBy) ? sortBy : 'name';
return {
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder, 
};
};
