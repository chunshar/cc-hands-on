'use strict';

const {
  addToCart,
  calcTotal,
  removeFromCart,
  checkStock,
  getOrderSummary,
  ITEMS,
} = require('../src/shop');

// ITEMS (参考):
// 1: Tシャツ     price 2000  stock 10
// 2: ジーンズ    price 8000  stock 5
// 3: スニーカー  price 12000 stock 3
// 4: キャップ    price 3000  stock 15

describe('addToCart', () => {
  test('存在しない商品IDのとき失敗レスポンスを返す', () => {
    const cart = [];
    const result = addToCart(cart, 999, 1);
    expect(result).toEqual({
      success: false,
      cart,
      message: '商品が見つかりません',
    });
  });

  test('数量が0のとき失敗レスポンスを返す', () => {
    const cart = [];
    const result = addToCart(cart, 1, 0);
    expect(result).toEqual({
      success: false,
      cart,
      message: '数量は1以上にしてください',
    });
  });

  test('数量が負のとき失敗レスポンスを返す', () => {
    const cart = [];
    const result = addToCart(cart, 1, -1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('数量は1以上にしてください');
  });

  test('在庫を超える数量のとき失敗レスポンスを返す', () => {
    const cart = [];
    const result = addToCart(cart, 3, 4); // stock 3
    expect(result).toEqual({
      success: false,
      cart,
      message: '在庫が不足しています',
    });
  });

  test('在庫ちょうどの数量は成功する（境界値）', () => {
    const cart = [];
    const result = addToCart(cart, 3, 3); // stock 3
    expect(result.success).toBe(true);
    expect(result.cart).toEqual([{ itemId: 3, qty: 3 }]);
    expect(result.message).toBe('カートに追加しました');
  });

  test('新規商品をカートに追加する', () => {
    const cart = [];
    const result = addToCart(cart, 1, 2);
    expect(result).toEqual({
      success: true,
      cart: [{ itemId: 1, qty: 2 }],
      message: 'カートに追加しました',
    });
    // 元の配列は変更されない
    expect(cart).toEqual([]);
  });

  test('既存商品の数量に加算する', () => {
    const cart = [{ itemId: 1, qty: 2 }];
    const result = addToCart(cart, 1, 3);
    expect(result.success).toBe(true);
    expect(result.cart).toEqual([{ itemId: 1, qty: 5 }]);
  });

  test('既存商品への加算で在庫を超えると失敗する', () => {
    const cart = [{ itemId: 3, qty: 2 }]; // stock 3
    const result = addToCart(cart, 3, 2);
    expect(result).toEqual({
      success: false,
      cart,
      message: '在庫が不足しています',
    });
  });

  test('他の商品が入ったカートに新規商品を追加できる', () => {
    const cart = [{ itemId: 1, qty: 1 }];
    const result = addToCart(cart, 2, 1);
    expect(result.success).toBe(true);
    expect(result.cart).toEqual([
      { itemId: 1, qty: 1 },
      { itemId: 2, qty: 1 },
    ]);
  });
});

describe('calcTotal', () => {
  test('空のカートは0を返す', () => {
    expect(calcTotal([])).toBe(0);
  });

  test('単一商品の合計金額を計算する', () => {
    expect(calcTotal([{ itemId: 1, qty: 2 }])).toBe(4000);
  });

  test('複数商品の合計金額を計算する', () => {
    const cart = [
      { itemId: 1, qty: 2 }, // 2000 * 2 = 4000
      { itemId: 2, qty: 1 }, // 8000 * 1 = 8000
    ];
    expect(calcTotal(cart)).toBe(12000);
  });

  test('存在しない商品IDは合計金額に含めない', () => {
    const cart = [
      { itemId: 1, qty: 1 }, // 2000
      { itemId: 999, qty: 5 }, // 見つからないので無視
    ];
    expect(calcTotal(cart)).toBe(2000);
  });
});

describe('removeFromCart', () => {
  test('指定したIDの商品をカートから除く', () => {
    const cart = [
      { itemId: 1, qty: 1 },
      { itemId: 2, qty: 1 },
    ];
    const result = removeFromCart(cart, 1);
    expect(result).toEqual([{ itemId: 2, qty: 1 }]);
  });

  test('該当する商品がなければ変更されない内容を返す', () => {
    const cart = [{ itemId: 1, qty: 1 }];
    const result = removeFromCart(cart, 999);
    expect(result).toEqual([{ itemId: 1, qty: 1 }]);
  });

  test('空のカートに対しても空配列を返す', () => {
    expect(removeFromCart([], 1)).toEqual([]);
  });

  test('元の配列を変更しない', () => {
    const cart = [
      { itemId: 1, qty: 1 },
      { itemId: 2, qty: 1 },
    ];
    removeFromCart(cart, 1);
    expect(cart).toHaveLength(2);
  });
});

describe('checkStock', () => {
  test('在庫が十分なら true を返す', () => {
    expect(checkStock(1, 5)).toBe(true); // stock 10
  });

  test('在庫ちょうどのとき true を返す（境界値）', () => {
    expect(checkStock(3, 3)).toBe(true); // stock 3
  });

  test('在庫を超えるとき false を返す', () => {
    expect(checkStock(3, 4)).toBe(false); // stock 3
  });

  test('存在しない商品IDのとき false を返す', () => {
    expect(checkStock(999, 1)).toBe(false);
  });
});

describe('getOrderSummary', () => {
  test('カートが空のとき失敗レスポンスを返す', () => {
    expect(getOrderSummary([], null)).toEqual({
      ok: false,
      msg: 'カートが空です',
    });
  });

  test('クーポンなしで注文内容を計算する', () => {
    const cart = [{ itemId: 1, qty: 2 }]; // subtotal 4000
    const result = getOrderSummary(cart, null);
    expect(result).toEqual({
      ok: true,
      subtotal: 4000,
      discount: 0,
      shipping: 0, // afterDisc 4000 >= 3000 のため送料無料
      tax: 400,
      total: 4400,
      msg: '注文内容を確認しました',
    });
  });

  test('coupon が undefined のときも割引なしで計算する', () => {
    const cart = [{ itemId: 4, qty: 1 }]; // subtotal 3000
    const result = getOrderSummary(cart, undefined);
    expect(result.discount).toBe(0);
  });

  test('coupon が空文字のときも割引なしで計算する', () => {
    const cart = [{ itemId: 4, qty: 1 }]; // subtotal 3000
    const result = getOrderSummary(cart, '');
    expect(result.discount).toBe(0);
  });

  test('SAVE10 クーポンで10%割引される', () => {
    const cart = [{ itemId: 2, qty: 1 }]; // subtotal 8000
    const result = getOrderSummary(cart, 'SAVE10');
    expect(result.ok).toBe(true);
    expect(result.discount).toBe(800);
    expect(result.subtotal).toBe(8000);
  });

  test('SAVE20 クーポンで20%割引される', () => {
    const cart = [{ itemId: 2, qty: 1 }]; // subtotal 8000
    const result = getOrderSummary(cart, 'SAVE20');
    expect(result.discount).toBe(1600);
  });

  test('FLAT500 クーポンで500円引きされる', () => {
    const cart = [{ itemId: 1, qty: 2 }]; // subtotal 4000
    const result = getOrderSummary(cart, 'FLAT500');
    expect(result.discount).toBe(500);
  });

  test('FLAT500 クーポンは合計金額を超えて割引しない（境界値）', () => {
    const cart = [{ itemId: 1, qty: 1 }]; // subtotal 2000 (< 500? no, 2000>500)
    const result = getOrderSummary(cart, 'FLAT500');
    // subtotal 2000 > 500 なので discount は 500 のまま
    expect(result.discount).toBe(500);
  });

  test('無効なクーポンコードのとき失敗レスポンスを返す', () => {
    const cart = [{ itemId: 1, qty: 1 }];
    const result = getOrderSummary(cart, 'INVALID');
    expect(result).toEqual({
      ok: false,
      msg: '無効なクーポンコードです',
    });
  });

  test('割引後の金額が3000円未満のとき送料500円がかかる', () => {
    const cart = [{ itemId: 1, qty: 1 }]; // subtotal 2000
    const result = getOrderSummary(cart, null);
    expect(result.shipping).toBe(500);
  });

  test('割引後の金額が3000円ちょうどのとき送料は0円（境界値）', () => {
    const cart = [{ itemId: 4, qty: 1 }]; // subtotal 3000
    const result = getOrderSummary(cart, null);
    expect(result.shipping).toBe(0);
  });

  test('税額は割引後の金額の10%を四捨五入した値になる', () => {
    const cart = [{ itemId: 1, qty: 1 }]; // subtotal 2000, tax = round(200) = 200
    const result = getOrderSummary(cart, null);
    expect(result.tax).toBe(200);
  });

  test('合計金額は割引後金額+税額+送料になる', () => {
    const cart = [{ itemId: 3, qty: 1 }]; // subtotal 12000
    const result = getOrderSummary(cart, 'SAVE10');
    // subtotal 12000, discount 1200, afterDisc 10800
    // shipping 0 (>=3000), tax round(1080)=1080
    // total = 10800 + 1080 + 0 = 11880
    expect(result).toEqual({
      ok: true,
      subtotal: 12000,
      discount: 1200,
      shipping: 0,
      tax: 1080,
      total: 11880,
      msg: '注文内容を確認しました',
    });
  });
});

describe('ITEMS', () => {
  test('商品マスタが期待する内容である', () => {
    expect(ITEMS).toEqual([
      { id: 1, name: 'Tシャツ', price: 2000, stock: 10 },
      { id: 2, name: 'ジーンズ', price: 8000, stock: 5 },
      { id: 3, name: 'スニーカー', price: 12000, stock: 3 },
      { id: 4, name: 'キャップ', price: 3000, stock: 15 },
    ]);
  });
});
