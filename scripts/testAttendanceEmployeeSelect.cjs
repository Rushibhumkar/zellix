const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ts = require('typescript');
const root = require('node:path').resolve(__dirname, '..') + '/';
function load(file, mocks) {
 const mod = {exports:{}};
 const out = ts.transpileModule(fs.readFileSync(root+file,'utf8'), {fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}});
 assert.equal(out.diagnostics.length,0);
 vm.runInNewContext('(function(require,module,exports){'+out.outputText+'})',{setTimeout,clearTimeout,Map})(n=>{assert.ok(n in mocks,n);return mocks[n]},mod,mod.exports);
 return mod.exports;
}
let request;
const api=load('services/hrmApi/attendanceListApi.ts',{'../authApi/axiosInstance':{axiosInstance:{get:async (...args)=>{request=args;return {data:{data:[],pagination:{currentPage:1,totalPage:1}}}}}}});
(async()=>{
const signal=new AbortController().signal;
await api.getAttendanceEmployees({search:'test@',pageParam:2,signal});
assert.equal(request[0],'/api/hrms/att/users');
assert.equal(request[1].params.search,'test@');assert.equal(request[1].params.page,2);assert.equal(request[1].params.limit,20);assert.equal(request[1].signal,signal);
let options, selected, fetches=0, states=[], cursor=0;
const employee={_id:'one',name:'First',email:'first@example.com'};
const query={data:{pages:[{data:[employee]},{data:[employee,{_id:'two',name:'Second',email:'second@example.com'}]}]},hasNextPage:true,isFetching:false,fetchNextPage:()=>fetches++};
const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),useEffect:()=>{},useState:initial=>{const i=cursor++;if(!(i in states))states[i]=initial;return [states[i],v=>states[i]=v]}};
const Component=load('myComponentsHRM/SearchBox/AttendanceEmployeeSelect.tsx',{
'@expo/vector-icons':{Feather:'Feather'},react:{...React,default:React},'react-native':Object.fromEntries(['ActivityIndicator','FlatList','Pressable','Text','TextInput','View'].map(x=>[x,x]).concat([['StyleSheet',{create:x=>x}]])),
'@tanstack/react-query':{useInfiniteQuery:o=>{options=o;return query}},'react-redux':{useSelector:()=>({user:{_id:'account'}})},'../../redux/userSlice':{selectUser:()=>{}},'../../services/hrmApi/attendanceListApi':api,'../../utils/attendanceDisplay':{attendanceUserName:u=>u.name},'../ModalWithBlur/ModalWithBlur':{default:'Modal'}
}).default;
function render(){cursor=0;return Component({employee,onSelect:e=>selected=e})}
function find(node,type){if(!node)return; if(Array.isArray(node)){for(const n of node){const r=find(n,type);if(r)return r}}else if(typeof node==='object'){if(node.type===type)return node;return find(node.props?.children,type)}}
let tree=render();assert.equal(options.enabled,false);assert.equal(options.queryKey[1],'account');
find(tree,'Pressable').props.onPress();tree=render();assert.equal(options.enabled,true);
assert.equal(options.getNextPageParam({pagination:{currentPage:1,totalPage:2}}),2);assert.equal(options.getNextPageParam({pagination:{currentPage:2,totalPage:2}}),undefined);
let list=find(tree,'FlatList');assert.equal(list.props.data.length,2);list.props.onEndReached();assert.equal(fetches,1);
query.isFetching=true;list.props.onEndReached();assert.equal(fetches,1);
const row=list.props.renderItem({item:list.props.data[1]});row.props.onPress();assert.equal(selected._id,'two');assert.equal(states[0],false);
query.isError=true;query.error={response:{status:403}};tree=render();list=find(tree,'FlatList');assert.equal(find(list.props.ListFooterComponent,'Pressable'),undefined);
// Exercise the actual screen: selection must update its route, reset filters and retain back navigation.
states=[];cursor=0;React.useCallback=fn=>fn;
let routeItem={user:{_id:'one',name:'Nested name'},name:'Old snapshot'}, nextParams, attendanceArgs;
let attendanceResult={data:[],isLoading:false,isError:false,isFetching:false,refetch:()=>{}};
const searchState={showSearch:false,closeSearch:()=>{searchState.closed=true},listRef:{current:{scrollToOffset:()=>{searchState.scrolled=true}}}};
const screenMocks={
  react:{...React,default:React},
  'react-native':Object.fromEntries(['ActivityIndicator','FlatList','Pressable','RefreshControl','Text','View'].map(x=>[x,x])),
  'react-redux':{useSelector:()=>({user:{_id:'account'}})},'../../redux/userSlice':{selectUser:()=>{}},
  '@react-navigation/native':{useRoute:()=>({params:{item:routeItem}}),useNavigation:()=>({navigate:()=>{},setParams:p=>nextParams=p})},
  '../../hooks/useGetQuerryHRM':{useGetSingleUserAttList:args=>{attendanceArgs=args;return attendanceResult}},
  '../../hooks/useHRMListingSearch':{useHRMListingSearch:()=>searchState},
  '../../utils/routesHRM':{routeAttendance:{AttendanceDetail:'detail'}},
  '../../myComponentsHRM/SearchBox/HRMFilters':{default:'Filters',hrmFilterCount:()=>0},
};
for(const [name,type] of Object.entries({
  '../../myComponentsHRM/SearchBox/AttendanceEmployeeSelect':'EmployeeSelect',
  '../../myComponentsHRM/LoadingCompo/LoadingCompo':'Loading',
  '../../myComponents/NoDataFound/NoDataFound':'NoData',
  '../../myComponentsHRM/ContainerHRM/ContainerHRM':'Container',
  '../../myComponentsHRM/Row/RowSingleUserAtt':'Row',
  '../../myComponentsHRM/SearchBox/ListingSearch':'ListingSearch'
}))screenMocks[name]={__esModule:true,default:type};
const Screen=load('screensHRM/AttendanceHRM/UserAttendanceList.tsx',screenMocks).default;
const renderScreen=()=>{cursor=0;return Screen()};
let screen=renderScreen();assert.equal(attendanceArgs.userId,'one');assert.equal(attendanceArgs.accountId,'account');
const picker=find(screen,'EmployeeSelect');assert.equal(picker.props.employee.name,'Nested name');
picker.props.onSelect({_id:'two',name:'Second'});assert.equal(nextParams.item.user,'two');assert.equal(searchState.closed,true);assert.equal(searchState.scrolled,true);
routeItem=nextParams.item;screen=renderScreen();assert.equal(attendanceArgs.userId,'two');assert.equal(attendanceArgs.search,'');assert.deepEqual(Object.keys(states[0]),[]);
attendanceResult={...attendanceResult,isError:true,error:{response:{status:403}},data:[{_id:'stale'}]};
screen=renderScreen();assert.equal(find(screen,'FlatList').props.data.length,0);assert.equal(find(find(screen,'FlatList').props.ListHeaderComponent,'Pressable'),undefined);
console.log('PASS: screen route switching, nested user normalization, filter reset and access-error stale-row protection.');
console.log('PASS: scoped endpoint, cancellation, account cache, pagination, deduplication, selection, closing, access errors.');
})().catch(e=>{console.error(e);process.exitCode=1});
