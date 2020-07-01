import AppError from '../errors/AppError';
import {getRepository, getCustomRepository} from 'typeorm'

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository'


interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}


class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    
    const balance = await transactionRepository.getBalance();
    
    if(type === 'outcome' && (balance.total - value) < 0){
      throw new AppError('You dont have enought balance.');
    }
   
    let categoryTransaction = await categoryRepository.findOne({where: {title: category} });

    if(!categoryTransaction){
      categoryTransaction = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryTransaction);
    };

    const newTransaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryTransaction
    });
    
    await transactionRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
