import { Client, Account } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') 
  .setProject('680e1d86001ddcd72036'); 

const account = new Account(client);

export { account };
