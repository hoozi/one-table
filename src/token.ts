import { InjectionKey } from 'vue';
import { OneTableColumnProps, OneTableProps } from './typings';

type ProvideTableData = {
  columns: OneTableColumnProps[];
  tableProps: Omit<OneTableProps, 'columns'>;
}

export const tableKey:InjectionKey<ProvideTableData> = Symbol();