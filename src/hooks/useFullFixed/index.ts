import { Ref } from 'vue';

export default function useFullFixed(root: Ref<HTMLElement | undefined>) {
  function setHeight() {
    requestAnimationFrame(() => {
      try {
        const fixed = root.value?.querySelector('.ant-table-fixed-left');
        const fixedTableBody = fixed?.querySelector('.ant-table-body-outer') as HTMLElement;
        const fixedHead = fixed?.querySelector('.ant-table-header') as HTMLElement;
        const thead = root.value?.querySelector('.ant-table-header')?.querySelector('.ant-table-thead') as HTMLElement;
        fixedTableBody.style.height = `calc(100% - ${thead.offsetHeight}px)`; 
        //fixedHead.style.height =  `${thead.offsetHeight}px`;
      } catch(e) {}
    });
  }
  setHeight();
  
}