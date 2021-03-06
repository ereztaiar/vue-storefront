import Vue from 'vue'
import * as types from '../../mutation-types'
import { ValidationError } from '../../lib/exceptions'
import { currentStoreView } from '@vue-storefront/store/lib/multistore'
import { ActionTree } from 'vuex'
import RootState from '../../types/RootState'
import OrderState from './types/OrderState'
const Ajv = require('ajv') // json validator

const actions: ActionTree<OrderState, RootState> = {
  /**
   * Place order - send it to service worker queue
   * @param {Object} commit method
   * @param {Object} order order data to be send
   */
  placeOrder ({ commit }, order) {
    const ajv = new Ajv()
    const orderSchema = require('./order.schema.json')
    const orderSchemaExtension = require('./order.schema.extension.json')
    const validate = ajv.compile(Object.assign(orderSchema, orderSchemaExtension))

    const storeView = currentStoreView()
    if (storeView.storeCode) {
      order.store_code = storeView.storeCode
    }

    if (!validate(order)) { // schema validation of upcoming order
      throw new ValidationError(validate.errors)
    } else {
      Vue.prototype.$bus.$emit('order-before-placed', { order: order })
      commit(types.ORDER_PLACE_ORDER, order)
      Vue.prototype.$bus.$emit('order-after-placed', { order: order })

      return true
    }
  }
}

export default actions
