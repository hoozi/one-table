import { OneTableColumnProps, OneTableProps } from '../typings';
import { omitBoolean, omitUndefinedAndEmptyArr, get } from '.';

export const valueEnumToArray = (
  valueEnumParams: any = new Map(),
): {
  value: string | number;
  text: string;
}[] => {
  const enumArray: {
    value: string | number;
    text: string;
    /** 是否禁用 */
    disabled?: boolean;
  }[] = [];
  const valueEnum = Object.prototype.toString.call(valueEnumParams) === '[object Map]' ? 
    valueEnumParams :
    new Map(Object.entries(valueEnumParams || {}));

  valueEnum.forEach((_:any, key:number | string) => {
    const value = (valueEnum.get(key) || valueEnum.get(`${key}`)) as {
      text: string;
      disabled?: boolean;
    };

    if (!value) {
      return;
    }

    if (typeof value === 'object' && value?.text) {
      enumArray.push({
        text: (value?.text as unknown) as string,
        value: key,
        disabled: value.disabled,
      });
      return;
    }
    enumArray.push({
      text: (value as unknown) as string,
      value: key,
    });
  });
  return enumArray;
};

export const defaultOnFilter = (value: string, record: any, dataIndex: string) => {
  const recordElement = get(record,dataIndex);
  const itemValue = String(recordElement) as string;

  return String(itemValue) === String(value);
};

export const genColumnKey = (key?: string | number, index?: number): string => {
  if (key) {
    return Array.isArray(key) ? key.join('-') : key.toString();
  }
  return `${index}`;
};

export function genColumns(props: {
  columns: OneTableColumnProps[],
  columnEmptyText: string | false,
  tableProps: OneTableProps
}): OneTableColumnProps[] {
  const { columns, tableProps, columnEmptyText } = props;
  return columns.map((columnProps, index) => {
    const {
      key,
      dataIndex,
      valueEnum,
      valueType,
      children,
      onFilter,
      filters = [],
    } = columnProps;
    //const columnKey = genColumnKey(key, index);
    const genOnFilter = () => {
      if (!tableProps?.request || onFilter === true) {
        return (value: string, row: any) => defaultOnFilter(value, row, dataIndex as string);
      }
      return omitBoolean(onFilter);
    };
    const column = {
      index,
      ...columnProps,
      className: `ant-table-${key || dataIndex} ${columnProps.className || ''}`,
      onFilter: genOnFilter(),
      filters: filters === true ?
          valueEnumToArray(valueEnum)
          .filter((valueItem) => valueItem && valueItem.value !== 'all') :
          filters,
      children: children ? genColumns({ ...props, columns: children }) : undefined
    }
    return omitUndefinedAndEmptyArr(column);
  }).filter(item => !item.hideInTable);
}