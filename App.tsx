import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, StatusBar} from 'react-native';
import {Camera} from 'expo-camera';
import {CameraType} from "expo-camera/build/Camera.types";
import {Feather as Icon} from '@expo/vector-icons'
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from "expo-media-library";

export default function App() {
    const [hasPermission, setHasPermission] = useState<boolean>();
    const [type, setType] = useState(Camera.Constants.Type.back);

    const cam = useRef<Camera | null>();

    const takePicture = async () => {
        if (cam.current) {
            const options = {
                quality:0.5,
                base64: true,
                skipProcessing:true
            }
            let photo = await cam.current?.takePictureAsync(options)

            const source = photo.uri

            cam.current?.pausePreview();
            await handlePreview(source)
            cam.current?.resumePreview()
        }
    }

    const handlePreview = async (source:string) => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        try {
            if (status === 'granted') {
                const assert = await MediaLibrary.createAssetAsync(source);
                console.log(assert)
                await MediaLibrary.createAssetAsync("RN_Captured", assert);
            } else {
                console.log("Oh You Missed to give permission");
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        (async () => {
            const {status} = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    if (hasPermission === null) {
        return <View/>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={"light-content"}/>
            <Camera style={styles.camera} type={type} ref={cam}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly'}}>
                    <TouchableOpacity onPress={() => takePicture()}>
                        <Icon name={'aperture'} size={50} color={'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setType(
                                type === Camera.Constants.Type.back
                                    ? Camera.Constants.Type.front
                                    : Camera.Constants.Type.back
                            );
                        }}>
                        <Text style={{fontSize: 18, color: 'white', marginBottom: 10}}> Flip </Text>
                    </TouchableOpacity>

                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
    },
    button: {
        flex: 0.1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
});
