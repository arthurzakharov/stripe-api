import { get, defaultTo } from 'lodash';
import { customers } from '../utils/stripe';

export type CreateCustomerPayload = {
  clientReferenceId: string;
  name: string;
  email: string;
  phone: string;
  address: {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postalCode: string;
    state: string;
  };
};

// Create new Customer
const create = async (payload: CreateCustomerPayload) => {
  try {
    return await customers
      .create({
        name: get(payload, 'name', ''),
        email: get(payload, 'email', ''),
        phone: get(payload, 'phone', ''),
        description: get(payload, 'clientReferenceId', ''),
        address: {
          city: get(payload, 'address.city', ''),
          country: get(payload, 'address.country', ''),
          line1: get(payload, 'address.line1', ''),
          line2: get(payload, 'address.line2', ''),
          postal_code: get(payload, 'address.postalCode', ''),
          state: get(payload, 'address.state', ''),
        },
        metadata: {
          client_reference_id: get(payload, 'clientReferenceId', ''),
        },
      })
      .then((customers) => {
        console.log(`Create new Customer ${customers.id}`);
        return customers;
      });
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

// Create new Customer or if there is already customer with such clientReferenceId reuse
// it and do not create new Customer. Avoiding create 2 customers with same clientReferenceId
const createOrReuse = async (payload: CreateCustomerPayload) => {
  try {
    const customer = await findByClientReferenceId(payload.clientReferenceId);
    if (customer) console.log(`Reuse Customer: ${customer.id}`);
    return customer || (await create(payload));
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

// Find Customer by clientReferenceId that is recorded in metadata.
const findByClientReferenceId = async (id: string) => {
  try {
    const result = await customers
      .search({
        query: `metadata["client_reference_id"]:"${defaultTo(id, '')}"`,
      })
      .then((searchResults) => {
        console.log(`Find ${searchResults.data.length} Customer by clientReferenceId: ${id}`);
        return searchResults;
      });
    /**
     * TODO: Future possible improvement. Will require deleteByCustomerId then
     * Currently we return only first found customer. Considering that there can be only 1 customer
     * with same clientReferenceId. In theory there is no chance to get here more than 1 Customer.
     * Need to make decision what to do with rest customers
     */
    return get(result, 'data[0]', undefined);
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

// TODO: Method is not currently used
// Delete Customer by customer's id.
const deleteByCustomerId = async (id: string) => {
  try {
    return await customers.del(id).then((customer) => {
      console.log(`Delete Customer ${id}`);
      return customer;
    });
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

export default {
  create,
  createOrReuse,
  findByClientReferenceId,
  deleteByCustomerId,
};
