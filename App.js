import React, {useRef} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {RichEditor, RichToolbar, defaultActions} from 'react-native-pell-rich-editor'
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'

import icon from './assets/video.png'

const host = 'http://7b024e15c0dd.ngrok.io/'

function nameSplit(filename) {
    filename = filename.split('.')
    filename = filename[filename.length - 2].split('/')
    filename = filename[filename.length - 1]
    return filename
}

export default function App() {
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [selectedVideo, setSelectedVideo] = React.useState(null);
    const richText = useRef(null);
    const _richText = () => richText.current;

    let openImagePickerAsync = async () => {
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });

        if (pickerResult.cancelled === true) {
            return;
        }
        setSelectedImage({localUri: pickerResult.uri});
    }

    let insertVideo = async () => {
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos
        });

        if (pickerResult.cancelled === true) {
            return;
        }
        setSelectedVideo({localUri: pickerResult.uri});
    }

    if (selectedImage !== null || selectedVideo !== null) {
        let type
        let filename
        let uri
        const formData = new FormData()
        if (selectedImage !== null) {
            filename = selectedImage.localUri
            filename = nameSplit(filename) + '.jpg'
            uri = selectedImage.localUri
            type = "image/jpeg"
        } else {
            filename = selectedVideo.localUri
            filename = nameSplit(filename) + '.mp4'
            uri = selectedVideo.localUri
            type = "video/mp4"
        }
        formData.append('file', {
            name: filename,
            type: type,
            uri: uri,
        })
        axios.post(host + 'upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            if (selectedImage !== null) {
                richText.current.insertImage(
                    host + response.data,
                )
            } else {
                richText.current.insertVideo(
                    host + response.data,
                );
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <View style={styles.container}>
            <ScrollView
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="always"
                style={styles.scrollView}
            >
                <RichEditor
                    ref={richText}
                    placeholder={'please input content'}
                    initialContentHTML={'Hello this is another new paragraph'}
                    editorStyle={styles.content}
                    onChange={(r) => console.log(r)}
                />
            </ScrollView>
            <RichToolbar
                getEditor={_richText}
                actions={['insertVideo', ...defaultActions]}
                iconMap={{
                    insertVideo: icon,
                }}
                insertVideo={insertVideo}
                onPressAddImage={openImagePickerAsync}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        paddingTop: 28,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editor: {
        width: '100%',
        height: '100%',
        backgroundColor: 'gray',
    },
    scrollView: {
        width: '100%',
        height: '100%',
    },
});
