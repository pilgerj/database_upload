import AppError from '../errors/AppError';
import {getCustomRepository, getConnection} from 'typeorm'
import TransactionsRepository from '../repositories/TransactionsRepository'
import Transaction from '../models/Transaction'

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    
    const deletedTransaction = await transactionRepository.findOne({
      where: {id: id}
    });
    
    if(!deletedTransaction){
      throw new AppError('This Transactions doesnt exists.');
    };
    
    await getConnection().createQueryBuilder()
                         .delete()
                         .from(Transaction)
                         .where("id = :id", {id: id})
                         .execute();
                         
    return;
  }
}

export default DeleteTransactionService;
