import React from 'react'
import { View, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

import { Loading } from '../../component';


export default class GuanyuYika extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            thislink: "http://tongchengyouyue.com/",
            isLoading: false,
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <View style={{ paddingBottom: 0, flex: 1 }}>
                <WebView source={{ uri: this.state.thislink }} style={{ flex: 1 }} 
                renderLoading={() => <Loading showLoading={true}></Loading>}
                />   
                
            </View>

        )
    }
}
