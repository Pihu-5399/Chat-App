import { conversationModel } from "../model/conversationModel.js"
import { messageModel } from "../model/messageModel.js"

export const sendMsg = async (req, res) => {
    // console.log(req.params);
    try {
        const { receiverId } = req.params
        const senderId = req.userId
        const { message } = req.body
        let conversation = await conversationModel.findOne({ participants: { $all: [senderId, receiverId] } })
        if (!conversation) {
            await conversationModel.create({ participants: [senderId, receiverId] })
        }
        const newMessage = new messageModel({ receiverId, senderId, message })
        conversation.messages.push(newMessage._id)
        // await newMessage.save()
        // await conversation.save()
        await Promise.all([newMessage.save(), conversation.save()])

        //socket.io functionalities here

        res.send({ message: "Msg Sent" })
    } catch (err) {
        res.status(500).send({ error: "Something went wrong", errorMessage: err.message })
    }
}

export const getMsg = async (req, res) => {
    try {
        const { receiverId } = req.params
        const senderId = req.userId
        const conversation = await conversationModel.findOne({
            participants: { $all: [senderId, receiverId] }
        }, { message: 1, _id: 0 }).populate("messages")
        res.status(200).send({ messages: conversation.messages })
    } catch (err) {
        res.status(500).send({ error: "Something went wrong", errorMessage: err.message })
    }
}