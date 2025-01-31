// src/services/contacts.js 
import { calculateWater } from "../utils/calculateWater.js";

const ContactsCollection = 1;  // для прибирання помилки

export const getAllContacts = async ({
    page = 1, 
    perPage = 10, 
    sortBy = 'name', 
    sortOrder = 'asc',
    filter = {},
}) => {
  try {
  const limit = perPage;
  const skip = (page - 1) * limit;
  
  const contactsQuery = ContactsCollection.find();

  if (filter.isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }
  if(filter.userId) {
    contactsQuery.where('userId').equals(filter.userId);
  }


  const totalItems = await ContactsCollection.find().merge(contactsQuery).countDocuments();
  const data = await contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder });

  // if (totalItems == null) {
  //   throw new Error('Total items not calculated correctly');
  // }
  const paginationData = calculateWater(totalItems, page, perPage);

  return {
    data,
    page, 
    perPage, 
    totalItems,
    ...paginationData, 
  };
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
};

export const getContactById = ({_id, userId}) => ContactsCollection.findOne({ _id: _id, userId });

export const getContact = filter => ContactsCollection.findOne(filter);

export const addContact = payload => ContactsCollection.create(payload);

export const updateContact = async ({ _id, userId }, payload) => {
  const result = await ContactsCollection.findOneAndUpdate(
    { _id, userId },
    payload,
    { new: true } 
  );

  return result;
};

export const deleteContact = async ({_id, userId}) => {
  const result = await ContactsCollection.findOneAndDelete({ _id, userId });
  return result;
};