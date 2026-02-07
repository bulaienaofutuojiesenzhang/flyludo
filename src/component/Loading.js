import React, { Component } from 'react';
import { View, StyleSheet, Image , Modal} from 'react-native';
import { Spinner } from 'native-base'; 
import { Colors, Metrics } from '../theme';

export default class Loading extends Component {
    _close() {

    }

    render () {
        const { showLoading, opacity, backgroundColor } = this.props
        return ( 
            <Modal visible={showLoading} transparent>
                <View style={[Styles.container, {opacity: opacity||0.9, backgroundColor: backgroundColor||'transparent'}]}>
                    <Spinner size="lg" color={Colors.subject} />
                </View>
            </Modal>
        )
    }
}

const Styles = StyleSheet.create({
    container: { flex: 1,  alignItems: 'center', justifyContent: 'center' },
});
