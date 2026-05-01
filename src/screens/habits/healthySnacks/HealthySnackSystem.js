// import React, { useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   ScrollView,
//   Image,
//   Dimensions,
// } from 'react-native';

// import ActionSheet from 'react-native-actions-sheet';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// import { Button, Header, Wrapper } from '../../../components';
// import { colors, fontFamily } from '../../../constant';

// const { height } = Dimensions.get('window');

// export default function SnackSystemUI() {
//   const actionSheetRef = useRef();

//   const [tab, setTab] = useState('request');
//   const [snackName, setSnackName] = useState('');
//   const [qty, setQty] = useState('');
//   const [image, setImage] = useState(null);

//   const [requests, setRequests] = useState([]);

//   // ---------------- IMAGE HANDLERS ----------------

//   const handleCamera = () => {
//     launchCamera({ mediaType: 'photo' }, res => {
//       if (res.assets && res.assets.length > 0) {
//         setImage(res.assets[0].uri);
//       }
//       actionSheetRef.current?.hide();
//     });
//   };

//   const handleGallery = () => {
//     launchImageLibrary({ mediaType: 'photo' }, res => {
//       if (res.assets && res.assets.length > 0) {
//         setImage(res.assets[0].uri);
//       }
//       actionSheetRef.current?.hide();
//     });
//   };

//   // ---------------- ACTIONS ----------------

//   const addRequest = () => {
//     if (!snackName || !qty) return;

//     const newReq = {
//       id: Date.now().toString(),
//       name: snackName,
//       // qty: Number(qty),
//       qty: qty,
//       status: 'pending',
//       image,
//     };

//     setRequests(prev => [newReq, ...prev]);

//     setSnackName('');
//     setQty('');
//     setImage(null);
//   };

//   const approveReq = id => {
//     setRequests(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, status: 'approved' } : item,
//       ),
//     );
//   };

//   const rejectReq = id => {
//     setRequests(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, status: 'rejected' } : item,
//       ),
//     );
//   };

//   const resetStatus = id => {
//     setRequests(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, status: 'pending' } : item,
//       ),
//     );
//   };

//   const deleteReq = id => {
//     setRequests(prev => prev.filter(item => item.id !== id));
//   };

//   const approvedList = requests.filter(r => r.status === 'approved');

//   // ---------------- COMMON IMAGE ----------------

//   const SnackImage = ({ uri }) =>
//     uri ? (
//       <Image source={{ uri }} style={styles.image} />
//     ) : (
//       <View style={styles.noImage}>
//         <Text style={{ color: colors.white }}>No Image</Text>
//       </View>
//     );

//   // ---------------- CARDS ----------------

//   const RequestCard = ({ item }) => (
//     <View style={styles.card}>
//       <SnackImage uri={item.image} />
//       <Text style={styles.title}>{item.name}</Text>
//       <Text style={styles.sub}>Qty: {item.qty}</Text>

//       <Text
//         style={[
//           styles.status,
//           item.status === 'approved' && styles.approved,
//           item.status === 'rejected' && styles.rejected,
//         ]}
//       >
//         {item.status.toUpperCase()}
//       </Text>
//     </View>
//   );

//   const ApprovedCard = ({ item }) => (
//     <View style={styles.card}>
//       <SnackImage uri={item.image} />
//       <Text style={styles.title}>{item.name}</Text>
//       <Text style={styles.sub}>Qty: {item.qty}</Text>
//       <Text style={styles.approved}>APPROVED</Text>
//     </View>
//   );

//   const AdminCard = ({ item }) => (
//     <View style={styles.card}>
//       <SnackImage uri={item.image} />

//       <Text style={styles.title}>{item.name}</Text>
//       <Text style={styles.sub}>Qty: {item.qty}</Text>

//       <Text
//         style={[
//           styles.status,
//           item.status === 'approved' && styles.approved,
//           item.status === 'rejected' && styles.rejected,
//         ]}
//       >
//         STATUS: {item.status.toUpperCase()}
//       </Text>

//       <View style={styles.row}>
//         <Button
//           title="Approve"
//           onPress={() => approveReq(item.id)}
//           buttonStyle={{ flex: 1, marginRight: 10 }}
//         />
//         <Button
//           title="Reject"
//           onPress={() => rejectReq(item.id)}
//           buttonStyle={{ flex: 1 }}
//         />
//       </View>

//       <View style={styles.row}>
//         <Button
//           title="Reset"
//           onPress={() => resetStatus(item.id)}
//           buttonStyle={{ flex: 1, marginRight: 10 }}
//         />
//         <Button
//           title="Delete"
//           onPress={() => deleteReq(item.id)}
//           buttonStyle={{ backgroundColor: 'red', flex: 1 }}
//         />
//       </View>
//     </View>
//   );

//   const tabs = ['request', 'approved', 'admin'];

//   // ---------------- UI ----------------

//   return (
//     <Wrapper>
//       <Header header="Snack System" />

//       {/* Tabs */}
//       <View style={styles.tabRow}>
//         {tabs.map(t => (
//           <TouchableOpacity
//             key={t}
//             onPress={() => setTab(t)}
//             style={[styles.tab, tab === t && styles.activeTab]}
//           >
//             <Text style={[styles.tabText, tab === t && styles.activeText]}>
//               {t.toUpperCase()}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView nestedScrollEnabled>
//         {/* REQUEST */}
//         {tab === 'request' && (
//           <View>
//             <View style={styles.card}>
//               <Text style={styles.label}>Add Snack Request</Text>

//               <TextInput
//                 placeholder="Snack Name"
//                 value={snackName}
//                 onChangeText={setSnackName}
//                 style={styles.input}
//                 placeholderTextColor={colors.white}
//               />

//               <TextInput
//                 placeholder="Quantity"
//                 value={qty}
//                 keyboardType="numeric"
//                 onChangeText={setQty}
//                 style={styles.input}
//                 placeholderTextColor={colors.white}
//               />

//               {/* Upload Button */}
//               <TouchableOpacity
//                 style={styles.upload}
//                 onPress={() => actionSheetRef.current?.show()}
//               >
//                 <Text style={styles.uploadText}>
//                   {image ? 'Change Image' : 'Upload Image'}
//                 </Text>
//               </TouchableOpacity>

//               {image && (
//                 <Image source={{ uri: image }} style={styles.preview} />
//               )}

//               <Button
//                 title="Submit Request"
//                 onPress={addRequest}
//                 buttonStyle={{ marginTop: 10 }}
//               />
//             </View>

//             <Text style={styles.sectionTitle}>My Requests</Text>

//             <FlatList
//               data={requests}
//               keyExtractor={i => i.id}
//               nestedScrollEnabled
//               renderItem={({ item }) => <RequestCard item={item} />}
//             />
//           </View>
//         )}

//         {/* APPROVED */}
//         {tab === 'approved' && (
//           <View>
//             <Text style={styles.sectionTitle}>Approved Snacks</Text>
//             <FlatList
//               data={approvedList}
//               keyExtractor={i => i.id}
//               nestedScrollEnabled
//               renderItem={({ item }) => <ApprovedCard item={item} />}
//             />
//           </View>
//         )}

//         {/* ADMIN */}
//         {tab === 'admin' && (
//           <View>
//             <Text style={styles.sectionTitle}>Admin Panel</Text>
//             <FlatList
//               data={requests}
//               keyExtractor={i => i.id}
//               renderItem={({ item }) => <AdminCard item={item} />}
//               nestedScrollEnabled
//             />
//           </View>
//         )}
//       </ScrollView>

//       {/* ACTION SHEET */}
//       <ActionSheet
//         ref={actionSheetRef}
//         containerStyle={{ paddingBottom: 20 }}
//         gestureEnabled
//       >
//         <Text style={styles.sheetTitle}>Upload Image</Text>

//         {/* HORIZONTAL BUTTONS */}
//         <View style={styles.row}>
//           <Button
//             title="📸 Camera"
//             onPress={handleCamera}
//             buttonStyle={{ flex: 1, marginRight: 10 }}
//           />

//           <Button
//             title="🖼️ Gallery"
//             onPress={handleGallery}
//             buttonStyle={{ flex: 1 }}
//           />
//         </View>

//         {/* CANCEL BELOW */}
//         <Button
//           title="Cancel"
//           onPress={() => actionSheetRef.current?.hide()}
//           buttonStyle={styles.cancelBtn}
//           textStyle={styles.cancelText} // if your Button supports textStyle
//         />
//       </ActionSheet>
//     </Wrapper>
//   );
// }

// // ---------------- STYLES ----------------

// const styles = StyleSheet.create({
// tabRow: {
//   flexDirection: 'row',
//   backgroundColor: '#DBD9EC',
//   borderRadius: 50,
//   padding: 5,
//   marginBottom: 10,
// },
// tab: { flex: 1, padding: 10, borderRadius: 50 },
// activeTab: { backgroundColor: colors.primary },

// tabText: {
//   textAlign: 'center',
//   color: colors.primary,
//   fontFamily: fontFamily.montserratBold,
// },
// activeText: { color: '#fff' },

//   card: {
//     backgroundColor: 'rgba(143, 175, 120,0.16)',
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 12,
//   },

//   image: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     marginBottom: 10,
//   },

//   preview: {
//     width: '100%',
//     height: 120,
//     borderRadius: 10,
//     marginTop: 10,
//   },

//   noImage: {
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(143, 175, 120,0.16)',
//     borderRadius: 10,
//     marginBottom: 10,
//   },

//   upload: {
//     backgroundColor: '#eee',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: 'center',
//   },

//   uploadText: {
//     fontFamily: fontFamily.montserratMedium,
//     color: '#555',
//   },

//   optionBtn: {
//     padding: 15,
//     marginHorizontal: 20,
//     marginTop: 15,
//     borderRadius: 10,
//     backgroundColor: '#f5f5f5',
//   },

//   optionText: {
//     fontSize: 16,
//     fontFamily: fontFamily.montserratMedium,
//   },

//   sheetTitle: {
//     fontSize: 20,
//     marginLeft: 20,
//     marginTop: 20,
//     fontFamily: fontFamily.montserratSemiBold,
//   },

//   title: {
//     fontSize: 16,
//     fontFamily: fontFamily.montserratSemiBold,
//     color: colors.white,
//   },
//   sub: { fontSize: 13, color: colors.white, marginTop: 4 },

//   status: {
//     marginTop: 6,
//     color: '#f59e0b',
//     fontFamily: fontFamily.montserratBold,
//   },

//   approved: { color: '#22c55e', marginTop: 6 },
//   rejected: { color: 'red', marginTop: 6 },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 10,
//     fontFamily: fontFamily.montserratMedium,
//     color: colors.white,
//   },

//   label: {
//     fontSize: 14,
//     color: colors.white,
//     fontFamily: fontFamily.montserratBold,
//   },
//   // row: {
//   //   flexDirection: 'row',
//   //   marginHorizontal: 20,
//   //   marginTop: 20,
//   // },

//   cancelBtn: {
//     marginTop: 20,
//     marginHorizontal: 20,
//     backgroundColor: '#eee',
//   },
//   cancelText: {
//     color: '#555',
//   },
//   sectionTitle: {
//     marginVertical: 10,
//     fontSize: 16,
//     fontFamily: fontFamily.montserratBold,
//     color: colors.white,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '1'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

const STATUS_COLORS = {
  pending: {
    color: '#FFC15A',
    bg: 'rgba(255,193,90,0.12)',
    border: 'rgba(255,193,90,0.3)',
  },
  approved: {
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
  },
  rejected: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
  },
};

export default function SnackSystemUI({ navigation }) {
  const [activeTab, setActiveTab] = useState('request');
  const [snackName, setSnackName] = useState('');
  const [qty, setQty] = useState('');
  const [image, setImage] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.assets?.length > 0) setImage(res.assets[0].uri);
      setShowImagePicker(false);
    });
  };

  const handleGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (res.assets?.length > 0) setImage(res.assets[0].uri);
      setShowImagePicker(false);
    });
  };

  const addRequest = () => {
    if (!snackName.trim() || !qty.trim()) return;
    setRequests(prev => [
      {
        id: Date.now().toString(),
        name: snackName.trim(),
        qty: qty.trim(),
        status: 'pending',
        image,
      },
      ...prev,
    ]);
    setSnackName('');
    setQty('');
    setImage(null);
  };

  const updateStatus = (id, status) =>
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));

  const deleteRequest = id =>
    setRequests(prev => prev.filter(r => r.id !== id));

  const approvedList = requests.filter(r => r.status === 'approved');

  const TABS = [
    { key: 'request', label: '📋 My List' },
    { key: 'approved', label: '✅ Approved' },
    { key: 'admin', label: '🛠 Admin' },
  ];

  return (
    <View style={styles.root}>
      <Header
        header={'Meatless Challenge'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Text style={styles.heroTitle}>🥜 Healthy Snack Planner</Text>
      <Text style={styles.heroSub}>
        Build and manage your healthy snack list
      </Text>

      {/* Tabs */}
      <View style={styles.tabWrap}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.8}
          >
            {activeTab === t.key && (
              <GradientBg
                id={`st${t.key}`}
                c1="#6A9455"
                c2="#3A5A2A"
                r={12}
                horizontal
              />
            )}
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {/* ── REQUEST TAB ── */}
        {activeTab === 'request' && (
          <>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add Snack Request</Text>

              <TextInput
                placeholder="Snack name (e.g. Mixed Nuts)"
                value={snackName}
                onChangeText={setSnackName}
                placeholderTextColor="rgba(255,255,255,0.25)"
                style={styles.input}
              />
              <TextInput
                placeholder="Quantity (e.g. 1 pack, 200g)"
                value={qty}
                onChangeText={setQty}
                placeholderTextColor="rgba(255,255,255,0.25)"
                style={styles.input}
              />

              {/* Image upload */}
              {!showImagePicker ? (
                <TouchableOpacity
                  style={[styles.uploadBtn, image && styles.uploadBtnFilled]}
                  onPress={() => setShowImagePicker(true)}
                  activeOpacity={0.8}
                >
                  {image ? (
                    <Image source={{ uri: image }} style={styles.uploadImg} />
                  ) : (
                    <View style={styles.uploadInner}>
                      <Svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Path
                          d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                          stroke="rgba(143,175,120,0.5)"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Circle
                          cx={12}
                          cy={13}
                          r={4}
                          stroke="rgba(143,175,120,0.5)"
                          strokeWidth={1.8}
                        />
                      </Svg>
                      <Text style={styles.uploadText}>
                        Add Photo (optional)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.pickerRow}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handleCamera}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerBtnText}>📸 Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handleGallery}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerBtnText}>🖼️ Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pickerBtn, styles.pickerBtnCancel]}
                    onPress={() => setShowImagePicker(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!snackName.trim() || !qty.trim()) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={addRequest}
                activeOpacity={0.85}
              >
                {snackName.trim() && qty.trim() && (
                  <GradientBg
                    id="addSnack"
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={14}
                    horizontal
                  />
                )}
                <Text
                  style={[
                    styles.submitBtnText,
                    (!snackName.trim() || !qty.trim()) &&
                      styles.submitBtnDisabledText,
                  ]}
                >
                  Submit Request
                </Text>
              </TouchableOpacity>
            </View>

            {requests.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>
                  My Requests ({requests.length})
                </Text>
                {requests.map(item => {
                  const s = STATUS_COLORS[item.status];
                  return (
                    <View key={item.id} style={styles.requestCard}>
                      {item.image && (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.cardImg}
                        />
                      )}
                      <View style={styles.cardRow}>
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{item.name}</Text>
                          <Text style={styles.cardQty}>Qty: {item.qty}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusPill,
                            { backgroundColor: s.bg, borderColor: s.border },
                          ]}
                        >
                          <Text style={[styles.statusText, { color: s.color }]}>
                            {item.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {requests.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🥜</Text>
                <Text style={styles.emptyText}>No snack requests yet</Text>
              </View>
            )}
          </>
        )}

        {/* ── APPROVED TAB ── */}
        {activeTab === 'approved' && (
          <>
            <Text style={styles.sectionLabel}>
              Approved Snacks ({approvedList.length})
            </Text>
            {approvedList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>✅</Text>
                <Text style={styles.emptyText}>No approved snacks yet</Text>
              </View>
            ) : (
              approvedList.map(item => (
                <View
                  key={item.id}
                  style={[styles.requestCard, styles.approvedCard]}
                >
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImg}
                    />
                  )}
                  <View style={styles.cardRow}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardQty}>Qty: {item.qty}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: STATUS_COLORS.approved.bg,
                          borderColor: STATUS_COLORS.approved.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: STATUS_COLORS.approved.color },
                        ]}
                      >
                        APPROVED
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── ADMIN TAB ── */}
        {activeTab === 'admin' && (
          <>
            <Text style={styles.sectionLabel}>
              Admin Panel ({requests.length} requests)
            </Text>
            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🛠</Text>
                <Text style={styles.emptyText}>No requests to review</Text>
              </View>
            ) : (
              requests.map(item => {
                const s = STATUS_COLORS[item.status];
                return (
                  <View key={item.id} style={styles.adminCard}>
                    {item.image && (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.cardImg}
                      />
                    )}
                    <View style={styles.cardRow}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardQty}>Qty: {item.qty}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: s.bg, borderColor: s.border },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: s.color }]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.adminBtnRow}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => updateStatus(item.id, 'approved')}
                        activeOpacity={0.85}
                      >
                        <GradientBg
                          id={`apr${item.id}`}
                          c1="#22c55e"
                          c2="#15803d"
                          r={10}
                          horizontal
                        />
                        <Text style={styles.adminBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => updateStatus(item.id, 'rejected')}
                        activeOpacity={0.85}
                      >
                        <GradientBg
                          id={`rej${item.id}`}
                          c1="#ef4444"
                          c2="#b91c1c"
                          r={10}
                          horizontal
                        />
                        <Text style={styles.adminBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={() => updateStatus(item.id, 'pending')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.resetBtnText}>Reset</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteRequest(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 18, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 21,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 4,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  /* Tabs */
  tabWrap: { flexDirection: 'row', marginHorizontal: 18, gap: 8 },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    marginBottom: 15,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabBtnActive: { borderColor: 'rgba(143,175,120,0.4)' },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  tabTextActive: {
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  sectionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  /* Form */
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 18,
  },
  formTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 14,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 10,
  },

  uploadBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(143,175,120,0.2)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  uploadBtnFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },
  uploadInner: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  uploadImg: { width: '100%', height: 110 },

  pickerRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pickerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(143,175,120,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    alignItems: 'center',
  },
  pickerBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pickerBtnText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  pickerCancelText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  submitBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  submitBtnDisabled: {},
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  submitBtnDisabledText: { color: 'rgba(255,255,255,0.3)' },

  /* Request/Approved cards */
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  approvedCard: {
    borderColor: 'rgba(34,197,94,0.2)',
    backgroundColor: 'rgba(34,197,94,0.04)',
  },
  cardImg: { width: '100%', height: 120, borderRadius: 10, marginBottom: 12 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  cardQty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontFamily: fontFamily.montserratSemiBold },

  /* Admin card */
  adminCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 12,
  },
  adminBtnRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBtnText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  resetBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 36, includeFontPadding: false, marginBottom: 10 },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
  },
});
