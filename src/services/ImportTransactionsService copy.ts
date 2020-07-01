import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import parse from 'csv-parse';
import { getCustomRepository} from 'typeorm';
import Category from '../models/Category';


class ImportTransactionsService { //Transaction[]
  async execute(filePath: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    console.log(filePath);
    const csvFilePath = path.resolve(filePath);

    const readCsvStream = fs.createReadStream(csvFilePath);
        
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCsv = readCsvStream.pipe(parseStream);
    const lines: string[] = [];
    
    parseCsv.on('data', line => {
      //console.log(line);
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCsv.on('end', resolve);
    });
    /*
    console.log('----lines------')
    //const arrays = lines.map(function(l){return Object.values(l)});
    console.log(lines);
    console.log('----lines0------')
    console.log(lines[0]);
    console.log('---lenght-----')
    console.log(lines.length);
    console.log('----------')
    */
    //const xxx = lines[0].split;
    //console.log(xxx)

    for (let i=0; i < lines.length; i++){
      let obj = {}
      console.log(`----${i}----`)
      console.log(lines[i]);
      console.log('%%')
      //obj[i] = lines[i];
      
      /*
      const toObj = new Object(Object.assign({}, lines[i]));
      console.log(toObj.hasOwnProperty)
      const newTransaction: Transaction = {
        title: toObj.0,
        type: toObj.
        value: 
      }*/
      
    }
    /*
    lines.forEach( l => {
      console.log(`> ${[]}`);
      const lineEx: string[] = l.split(',');
      console.log(lineEx);
      
    })*/
    
    return;



  }
}

export default ImportTransactionsService;