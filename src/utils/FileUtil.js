import Cameraroll from '@react-native-camera-roll/camera-roll';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * @ProjectName:  ttyyRnApp
 * @ClassName:    FileUtils
 * @Desc:         作用描述:
 * @source:       来源:
 * @Author:       wangding
 * @CreateDate:   2020/8/8 2:02 下午
 * @Version:      1.0.0
 */

const ExternalDirectoryPath = RNFS.ExternalDirectoryPath;

export default class FileUtil {

    /**
     * 判断文件是否存在  文件存在返回:true  不存在返回:false
     * @param filePath 文件路径
     * @returns {Promise<boolean>}
     */
    static async fileExit(filePath) {
        return  await RNFS.exists(filePath);
    }

    /**
     * 新建文件夹
     * @param folderName
     * @returns {Promise<void>}
     */
    static async mkdir(folderName) {
        return  await RNFS.mkdir(folderName);
    }

    /**
     * 将内容写入本地文本
     * @param targetName 目标文件名称(类似text.txt)
     * @param content 文本内容
     * @returns {Promise<void>}
     */
    static async writeFile(targetName,content) {
        return await RNFS.writeFile(`${ExternalDirectoryPath}/${targetName}`,content,'utf8');
    }

    /**
     * 读取文本内容
     * @param fileName 文件名称
     * @returns {Promise<string>}
     */
    static async readFile(fileName) {
        return await RNFS.readFile(`${ExternalDirectoryPath}/${fileName}`);
    }

    /**
     * 在已有的txt上添加新的文本
     * @param fileName 要追加的目标文本名称
     * @param content 要添加的文本信息
     * @returns {Promise<void>}
     */
    static async appendFile(fileName, content) {
        return await RNFS.appendFile(`${ExternalDirectoryPath}/${fileName}`,content,'utf8')
    }

    /**
     * 删除本地文件
     * @param targetName 要删除的文件名称
     * @returns {Promise<void>}
     */
    static async deleteFile(targetName) {
        return await RNFS.unlink(`${ExternalDirectoryPath}/${targetName}`);
    }

    /**
     * 下载图片，并保存到相册
     */
    static downLoadImageSaveToAlbum(imageUrl) {
        let dirs = Platform.OS === 'ios' ? RNFS.LibraryDirectoryPath : RNFS.ExternalDirectoryPath; // 外部文件，共享目录的绝对路径
        const downloadDest = `${dirs}/${((Math.random() * 1000) | 0)}.jpg`;
        const options = {
            fromUrl: imageUrl,
            toFile: downloadDest,
            background: true,
            begin: (res) => {
                // Loading.show();
                console.log('开始下载------> ',res);
                console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
            },
        };

        try {
            const ret = RNFS.downloadFile(options);
            ret.promise.then(res => {
                // Loading.dismiss();
                console.log('success', res);
                console.log('file://' + downloadDest);
                let promise = Cameraroll.saveToCameraRoll(downloadDest); // downloadDest可以替换成imgURL(网络图片地址)
                promise.then(result => {
                    alert('保存成功！地址如下：\n' + result);
                }).catch(function(error) {
                    console.log('error', error);
                    alert('保存失败！\n' + error);
                });
            })
        } catch (e) {
            console.log('e------------>', e);
        }
    }
}
