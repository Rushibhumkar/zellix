import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
} from "react-native";
import CustomText from "../CustomText/CustomText";
import { color } from "../../const/color";
import NoDataFound from "../NoDataFound/NoDataFound";
import SkeletonLoadingLead from "../../components/Leads/SkeletonLoadingLead/SkeletonLoadingLead";

interface InfiniteScrollProps {
  query: {
    data: any[];
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
    // pageInfo: any;
  };
  renderItems: React.FC<{ index: number; item: any }>;
  noData?: JSX.Element;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  query,
  renderItems,
  noData = <NoDataFound />,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = query || {};
  const [refreshing, setRefreshing] = useState(false);

  const onEndReach = () => {
    if (
      !!hasNextPage &&
      !isFetchingNextPage &&
      !isLoading &&
      data?.length > 0
    ) {
      fetchNextPage?.();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch?.();
    setRefreshing(false);
  };

  const MemoizedRenderItems = ({
    index,
    item,
  }: {
    index: number;
    item: any;
  }) => <>{renderItems({ index, item })}</>;

  return (
    <FlatList
      data={data}
      renderItem={({ index, item }) => (
        <MemoizedRenderItems index={index} item={item} />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 50,
      }}
      ListEmptyComponent={
        <>
          {isLoading && <SkeletonLoadingLead />}
          {!isLoading && data?.length === 0 && noData}
        </>
      }
      onEndReached={onEndReach}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#002E6B" />
        ) : null
      }
      keyExtractor={(item, index) => `${item?._id}-${index}`}
      initialNumToRender={10}
      maxToRenderPerBatch={50}
      windowSize={5}
    />
  );
};

export default React.memo(InfiniteScroll);
