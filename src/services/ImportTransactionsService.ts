import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import parse from 'csv-parse';
import { getCustomRepository, getRepository, In} from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;

}

class ImportTransactionsService { 
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);
    const contactsReadStream = fs.createReadStream(filePath);
        
    const parsers = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCsv = contactsReadStream.pipe(parsers);

    const transactions: CsvTransaction[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => cell.trim());

      if ( !title || !type || !value) return;  

      categories.push(category);
      transactions.push({title, type, value, category})

    });

    //ira dar um 'resolve' quando o csv disparar o 'end', significando qe terminou de ler o arq.
    await new Promise(resolve => parseCsv.on('end', resolve));
    //ira buscar as categorias ja existentes
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    });
    //mapeita pelo title
    const existentsCategoriesTitle = existentCategories.map((cat: Category) => cat.title);
    // 1o filter: retorna todas as cats que nao existem ainda.
    // 2o filter: retirar as categorias duplicadas.
    const addCategoryTitles = categories.filter(cat => !existentsCategoriesTitle.includes(cat))
                                        .filter( (value, index, self) => self.indexOf(value) === index);

    //criar as cats e salvar
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map( title => ( {title} ) )
    );
    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];
   
    const newTransactions = await transactionRepository.create(
      transactions.map( tr => ({
        title: tr.title,
        type: tr.type,
        value: tr.value,
        category: finalCategories.find(cat => cat.title === tr.category),
      })),
    );

    await transactionRepository.save(newTransactions);

    await fs.promises.unlink(filePath);
    
    return newTransactions;
  }
}

export default ImportTransactionsService;