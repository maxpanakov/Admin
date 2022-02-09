import clsx from "clsx"
import { useAdminDeleteVariant, useAdminUpdateVariant } from "medusa-react"
import React, { useState } from "react"
import VariantEditor from "../../domain/products/details/variants/variant-editor"
import useImperativeDialog from "../../hooks/use-imperative-dialog"
import useToaster from "../../hooks/use-toaster"
import { getErrorMessage } from "../../utils/error-messages"
import EditIcon from "../fundamentals/icons/edit-icon"
import TrashIcon from "../fundamentals/icons/trash-icon"
import Table from "../molecules/table"
import { Wrapper } from "./elements"
import { useGridColumns } from "./use-grid-columns"

const VariantGrid = ({ product, variants, edit, onVariantsChange }) => {
  const [selectedVariant, setSelectedVariant] = useState(null)

  const updateVariant = useAdminUpdateVariant(product?.id)
  const deleteVariant = useAdminDeleteVariant(product?.id)

  const toaster = useToaster()
  const dialog = useImperativeDialog()

  const columns = useGridColumns(product, edit)

  const handleChange = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    }

    onVariantsChange(newVariants)
  }

  const getDisplayValue = (variant, column) => {
    const { formatter, field } = column
    return formatter ? formatter(variant[field]) : variant[field]
  }

  const handleUpdateVariant = (data) => {
    updateVariant.mutate(
      { variant_id: selectedVariant?.id, ...data },
      {
        onSuccess: () => {
          toaster("Successfully update variant", "success")
          setSelectedVariant(null)
        },
        onError: (err) => {
          toaster(getErrorMessage(err), "error")
        },
      }
    )
  }

  const handleDeleteVariant = async (variant) => {
    const shouldDelete = await dialog({
      heading: "Delete product variant",
      text: "Are you sure?",
    })

    if (shouldDelete) {
      return deleteVariant.mutate(variant.id)
    }
  }

  const editVariantActions = (variant) => {
    return [
      {
        label: "Edit",
        icon: <EditIcon />,
        onClick: () => setSelectedVariant(variant),
      },
      {
        label: "Delete",
        icon: <TrashIcon />,
        onClick: () => handleDeleteVariant(variant),
        variant: "danger",
      },
    ]
  }

  return (
    <Wrapper>
      <Table>
        <Table.Head>
          <Table.HeadRow>
            {columns.map((col) => (
              <Table.HeadCell className="w-[100px] px-2 py-4">
                {col.header}
              </Table.HeadCell>
            ))}
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>
          {variants.map((variant, i) => {
            return (
              <Table.Row
                color={"inherit"}
                key={i}
                actions={edit && editVariantActions(variant)}
                className="py-4"
              >
                {columns.map((col, j) => {
                  return (
                    <Table.Cell key={j} className="p-1">
                      {edit ? (
                        <div className="px-2 py-4">
                          {getDisplayValue(variant, col)}
                        </div>
                      ) : (
                        <input
                          key={j}
                          className={clsx(
                            "outline-none outline-0 leading-base bg-transparent",
                            "py-4 px-2 w-full h-full border rounded-rounded border-transparent",
                            "inter-small-regular placeholder:text-grey-40",
                            "focus-within:shadow-input focus-within:border focus-within:border-violet-60"
                          )}
                          value={variant[col.field]}
                          onChange={({ currentTarget }) =>
                            handleChange(i, col.field, currentTarget.value)
                          }
                        />
                      )}
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      {selectedVariant && (
        <VariantEditor
          variant={selectedVariant}
          onCancel={() => setSelectedVariant(null)}
          onSubmit={handleUpdateVariant}
        />
      )}
    </Wrapper>
  )
}

export default VariantGrid