import { Layout } from '@/components/Layout';
import { DomainTree } from '@/components/standard/DomainTree';
import { StandardList } from '@/components/standard/StandardList';
import { businessDomains } from '@/store/useStandardStore';

export default function Catalog() {
  return (
    <Layout title="标准目录" subtitle="浏览和查询企业数据标准">
      <div className="flex gap-6 h-full">
        <div className="w-60 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-3 overflow-y-auto">
          <div className="text-sm font-medium text-slate-700 mb-3 px-2">业务域导航</div>
          <DomainTree domains={businessDomains} />
        </div>

        <div className="flex-1 min-w-0">
          <StandardList />
        </div>
      </div>
    </Layout>
  );
}
