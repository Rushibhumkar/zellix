import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../myComponents/CustomText/CustomText'
import moment from 'moment'
import CustomBtn from '../../../myComponents/CustomBtn/CustomBtn'
import EditIcon from '../../../assets/svgHRM/EditIcon'
import DeleteIcon from '../../../assets/svgHRM/DeleteIcon'
import { myConsole } from '../../../hooks/useConsole'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../redux/userSlice'
import { roleEnum } from '../../../utils/data'

interface TNotesCard {
  noteArr: any;
  onEdit: (a: { id: string, note: string }) => void;
  onDelete: (id: string) => void;
  isLoadingDelete: string;
}
const NotesCard = ({
  noteArr = [],
  onEdit,
  onDelete,
  isLoadingDelete
}: TNotesCard) => {
  const { user } = useSelector(selectUser);
  const isSubSup = user?.role === roleEnum?.sub_admin || user?.role === roleEnum?.sup_admin;
  // const noteByCreated = isSubSup ? noteArr || [] : noteArr.filter((el: any) => el?.createdBy === user?._id) || []
  return (
    <View style={{ marginBottom: 10 }}>
      {noteArr?.map((item, i) => {
        i === 0 && myConsole('itemNotes', item);

        return <View
          key={i}
          style={{
            borderWidth: 0.5,
            padding: 10,
            borderRadius: 10,
            marginBottom: 8
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10
            }}
          >
            {(isSubSup || item?.createdBy === user?._id) ? <CustomText
              fontWeight='500'
            >{item?.createdByName || 'N/A'}
            </CustomText>
              :
              <CustomText> </CustomText>
            }
            <CustomText
              fontWeight='500'
            >{item?.createdAt ? moment(item?.createdAt).format('DD/MM/YYYY A') : 'N/A'}
            </CustomText>
          </View>
          <CustomText
            fontWeight='300'>
            {item?.note || 'N/A'}
          </CustomText>
          {(isSubSup || item?.createdBy === user?._id) && <View
            style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, gap: 15 }}
          >
            <EditIcon
              onPress={() => {
                onEdit({
                  note: item?.note || '',
                  id: item?._id || ''
                })
              }}
            />
            {/* {isLoadingDelete === item?._id ? <ActivityIndicator /> : <DeleteIcon
              onPress={() => { onDelete(item?._id) }}
            />} */}
          </View>}
        </View>
      })}
    </View>
  )
}

export default NotesCard

const styles = StyleSheet.create({})