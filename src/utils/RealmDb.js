import Realm from 'realm';

/***表定义区**/
const Schema = {
    Chat: 'Chattest',
}
const ChatSchema = {
    name: Schema.Chat,
    properties: {
      id: 'string',
      type: 'string',
      targetId: 'string',
      chatInfo: 'string',
      renderTime: 'bool',
      sendStatus: 'int',
      time: { type: "string", default: new Date().getTime().toString() },
    },
    primaryKey: 'id',
};

const config = {
    schema: [ChatSchema],
    // path: "./myrealm/data"
  };


/***表使用区**/
export default {
    Schema,
    async writeToRealm(tabName,obj){
        let realm = await Realm.open(config);
        realm.write(() => {
            let res = realm.create(tabName, obj, true);
            realm.close();
            return res;
        })  
    },
    async queryAllFromRealm(tabName){
        let realm = await Realm.open(config);
        let obj = realm.objects(tabName);
        let objStr = JSON.stringify(obj);
        realm.close();
        return JSON.parse(objStr);
    },
    async clearAllFromRealm(tabName){
        let realm = await Realm.open(config);
        realm.write(() => {
            let arrays = realm.objects(tabName);
            let res = realm.delete(arrays);
            realm.close();
            return res;
        })
    },
    async clearRowFromRealm(tabName,id){
        let realm = await Realm.open(config);
        realm.write(() => {
            let arrays = realm.objects(tabName);
            let row = arrays.filtered('id==' + id);
            let res = realm.delete(row);
            return res;
        })
    },
}