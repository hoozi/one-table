const prefixCls = 'one-pro'

const getCls = (suffixCls?: string) => suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;

export default function usePrefix(suffixCls?:string) {
  return getCls(suffixCls);
}