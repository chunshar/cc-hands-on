'use strict';

const ITEMS = [
  { id: 1, name: 'Tシャツ',     price: 2000,  stock: 10 },
  { id: 2, name: 'ジーンズ',   price: 8000,  stock: 5  },
  { id: 3, name: 'スニーカー', price: 12000, stock: 3  },
  { id: 4, name: 'キャップ',   price: 3000,  stock: 15 },
];

const COUPON_RATES = { SAVE10: 0.1, SAVE20: 0.2 };

function findItem(itemId) {
  return ITEMS.find((item) => item.id === itemId) || null;
}

function addToCart(cart, itemId, qty) {
  const found = findItem(itemId);
  if (found == null) {
    return { success: false, cart: cart, message: '商品が見つかりません' };
  }
  if (qty <= 0) {
    return { success: false, cart: cart, message: '数量は1以上にしてください' };
  }
  const existingEntry = cart.find((e) => e.itemId == itemId);
  const cur = existingEntry ? existingEntry.qty : 0;
  if (cur + qty > found.stock) {
    return { success: false, cart: cart, message: '在庫が不足しています' };
  }
  if (existingEntry) {
    return {
      success: true,
      cart: cart.map((e) => (e.itemId == itemId ? { itemId: e.itemId, qty: e.qty + qty } : e)),
      message: 'カートに追加しました',
    };
  }
  return { success: true, cart: [...cart, { itemId: itemId, qty: qty }], message: 'カートに追加しました' };
}

function calcTotal(cart) {
  return cart.reduce((t, entry) => {
    const item = findItem(entry.itemId);
    return item ? t + item.price * entry.qty : t;
  }, 0);
}

function removeFromCart(cart, itemId) {
  return cart.filter((entry) => entry.itemId != itemId);
}

function checkStock(itemId, qty) {
  const item = findItem(itemId);
  if (!item) return false;
  return item.stock >= qty;
}

function getOrderSummary(cart, coupon) {
  if (cart.length === 0) {
    return { ok: false, msg: 'カートが空です' };
  }
  const total = calcTotal(cart);
  let disc = 0;
  if (coupon != null && coupon != '') {
    if (coupon in COUPON_RATES) {
      disc = total * COUPON_RATES[coupon];
    } else if (coupon === 'FLAT500') {
      disc = Math.min(500, total);
    } else {
      return { ok: false, msg: '無効なクーポンコードです' };
    }
  }
  const afterDisc = total - disc;
  const ship = afterDisc < 3000 ? 500 : 0;
  const tax = Math.round(afterDisc * 0.1);
  return {
    ok: true,
    subtotal: total,
    discount: disc,
    shipping: ship,
    tax: tax,
    total: afterDisc + tax + ship,
    msg: '注文内容を確認しました',
  };
}

module.exports = { addToCart, calcTotal, removeFromCart, checkStock, getOrderSummary, ITEMS };
