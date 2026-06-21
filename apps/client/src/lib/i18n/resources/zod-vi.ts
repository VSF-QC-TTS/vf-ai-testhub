export const zodVi = {
  errors: {
    invalid_type: "Mong đợi {{expected}}, nhận được {{received}}",
    invalid_type_received_undefined: "Bắt buộc",
    invalid_type_received_null: "Bắt buộc",
    invalid_literal: "Giá trị không hợp lệ, mong đợi {{expected}}",
    unrecognized_keys: "Khóa không hợp lệ trong đối tượng: {{- keys}}",
    invalid_union: "Đầu vào không hợp lệ",
    invalid_union_discriminator: "Giá trị phân biệt không hợp lệ. Mong đợi {{- options}}",
    invalid_enum_value: "Giá trị enum không hợp lệ. Mong đợi {{- options}}, nhận được '{{received}}'",
    invalid_arguments: "Đối số hàm không hợp lệ",
    invalid_return_type: "Kiểu trả về của hàm không hợp lệ",
    invalid_date: "Ngày không hợp lệ",
    custom: "Đầu vào không hợp lệ",
    invalid_intersection_types: "Không thể kết hợp các kết quả giao nhau",
    not_multiple_of: "Số phải là bội số của {{multipleOf}}",
    not_finite: "Số phải là số hữu hạn",
    invalid_string: {
      email: "Email không hợp lệ",
      url: "Đường dẫn không hợp lệ",
      uuid: "UUID không hợp lệ",
      cuid: "CUID không hợp lệ",
      regex: "Định dạng không hợp lệ",
      datetime: "Thời gian không hợp lệ",
      startsWith: "Đầu vào phải bắt đầu bằng \"{{startsWith}}\"",
      endsWith: "Đầu vào phải kết thúc bằng \"{{endsWith}}\""
    },
    too_small: {
      array: {
        exact: "Mảng phải chứa đúng {{minimum}} phần tử",
        inclusive: "Mảng phải chứa ít nhất {{minimum}} phần tử",
        not_inclusive: "Mảng phải chứa nhiều hơn {{minimum}} phần tử"
      },
      string: {
        exact: "Chuỗi phải chứa đúng {{minimum}} ký tự",
        inclusive: "Chuỗi phải dài ít nhất {{minimum}} ký tự",
        not_inclusive: "Chuỗi phải dài hơn {{minimum}} ký tự"
      },
      number: {
        exact: "Số phải đúng bằng {{minimum}}",
        inclusive: "Số phải lớn hơn hoặc bằng {{minimum}}",
        not_inclusive: "Số phải lớn hơn {{minimum}}"
      },
      set: {
        exact: "Đầu vào không hợp lệ",
        inclusive: "Đầu vào không hợp lệ",
        not_inclusive: "Đầu vào không hợp lệ"
      },
      date: {
        exact: "Ngày phải đúng là {{- minimum, datetime}}",
        inclusive: "Ngày phải sau hoặc bằng {{- minimum, datetime}}",
        not_inclusive: "Ngày phải sau {{- minimum, datetime}}"
      }
    },
    too_big: {
      array: {
        exact: "Mảng phải chứa đúng {{maximum}} phần tử",
        inclusive: "Mảng phải chứa tối đa {{maximum}} phần tử",
        not_inclusive: "Mảng phải chứa ít hơn {{maximum}} phần tử"
      },
      string: {
        exact: "Chuỗi phải chứa đúng {{maximum}} ký tự",
        inclusive: "Chuỗi phải dài tối đa {{maximum}} ký tự",
        not_inclusive: "Chuỗi phải ngắn hơn {{maximum}} ký tự"
      },
      number: {
        exact: "Số phải đúng bằng {{maximum}}",
        inclusive: "Số phải nhỏ hơn hoặc bằng {{maximum}}",
        not_inclusive: "Số phải nhỏ hơn {{maximum}}"
      },
      set: {
        exact: "Đầu vào không hợp lệ",
        inclusive: "Đầu vào không hợp lệ",
        not_inclusive: "Đầu vào không hợp lệ"
      },
      date: {
        exact: "Ngày phải đúng là {{- maximum, datetime}}",
        inclusive: "Ngày phải trước hoặc bằng {{- maximum, datetime}}",
        not_inclusive: "Ngày phải trước {{- maximum, datetime}}"
      }
    }
  },
  validations: {
    email: "email",
    url: "đường dẫn",
    uuid: "uuid",
    cuid: "cuid",
    regex: "regex",
    datetime: "thời gian"
  },
  types: {
    function: "hàm",
    number: "số",
    string: "chuỗi",
    nan: "nan",
    integer: "số nguyên",
    float: "số thực",
    boolean: "boolean",
    date: "ngày",
    bigint: "bigint",
    undefined: "undefined",
    symbol: "symbol",
    null: "null",
    array: "mảng",
    object: "đối tượng",
    unknown: "không xác định",
    promise: "promise",
    void: "void",
    never: "never",
    map: "map",
    set: "set"
  }
}
