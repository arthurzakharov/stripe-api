import { customers } from '@utils/stripe';
import { type CustomerType } from '@utils/types';

// Create new Customer
const create = async (customer: CustomerType) => {
  try {
    return await customers
      .create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        description: customer.clientReferenceId,
        address: {
          city: customer.address.city,
          country: customer.address.country,
          line1: customer.address.line1,
          line2: customer.address.line2,
          postal_code: customer.address.postalCode,
          state: customer.address.state,
        },
        metadata: {
          client_reference_id: customer.clientReferenceId,
        },
      })
      .then((customers) => {
        console.log(`Create new Customer ${customers.id}`);
        return customers;
      });
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// Create new Customer or if there is already customer with such clientReferenceId reuse
// it and do not create new Customer. Avoiding create 2 customers with same clientReferenceId
const createOrReuse = async (customer: CustomerType) => {
  try {
    const foundCustomer = await findByClientReferenceId(customer.clientReferenceId);
    if (foundCustomer) console.log(`Reuse Customer: ${foundCustomer.id}`);
    return foundCustomer || (await create(customer));
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// Find Customer by clientReferenceId that is recorded in metadata.
const findByClientReferenceId = async (id: string) => {
  try {
    const result = await customers
      .search({
        query: `metadata["client_reference_id"]:"${id}"`,
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
    return result.data[0] || undefined;
  } catch (e) {
    throw new Error((e as Error).message);
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
    throw new Error((e as Error).message);
  }
};

export default {
  create,
  createOrReuse,
  findByClientReferenceId,
  deleteByCustomerId,
};
