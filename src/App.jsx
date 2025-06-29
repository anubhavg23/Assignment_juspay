import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "./components/button"
import { Checkbox } from "./components/checkbox"
import { ChevronDown, X, Trash2 } from "lucide-react"


export default function ScratchClone() {
  const [sprites, setSprites] = useState([])
  const [selectedSprite, setSelectedSprite] = useState(null)
  const [heroMode, setHeroMode] = useState(false)
  const [nextSpriteId, setNextSpriteId] = useState(1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState(null)
  const [spritePrograms, setSpritePrograms] = useState({})
  const [spriteBubbles, setSpriteBubbles] = useState({})
  const canvasRef = useRef(null)
  const dragStateRef = useRef({ isDragging: false, draggedSprite: null })
  const lastCollisionRef = useRef({})

  // Canvas boundaries
  const CANVAS_PADDING = 56

  // Available sprite options
  const availableSprites = [
    { name: "Mega Charizard X", image: "public/images/mega-charizard-x.png" },
    { name: "Groudon", image: "public/images/groudon.png" },
    { name: "Rayquaza", image: "public/images/rayquaza.png" },
    { name: "Lucario", image: "public/images/lucario.png" },
  ]

  const motionBlocks = [
    { type: "move", label: "Move", value: "10", unit: "steps" },
    { type: "turn", label: "Turn", value: "30", unit: "degrees" },
    { type: "goto", label: "Go To", x: "0", y: "0" },
    { type: "repeat", label: "Repeat", value: "3", unit: "times" },
  ]

  const looksBlocks = [
    { type: "say", label: "Say", text: "Hello", duration: "2", unit: "sec" },
    { type: "think", label: "Think", text: "Hmm...", duration: "2", unit: "sec" },
  ]

  const currentSprite = sprites.find((s) => s.id === selectedSprite)

  // Function to constrain sprite position within canvas
  const constrainToCanvas = useCallback((x, y) => {
    if (!canvasRef.current) return { x, y }

    const rect = canvasRef.current.getBoundingClientRect()
    const maxX = rect.width / 2 - CANVAS_PADDING
    const maxY = rect.height / 2 - CANVAS_PADDING
    const minX = -rect.width / 2 + CANVAS_PADDING
    const minY = -rect.height / 2 + CANVAS_PADDING

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    }
  }, [])

  // Smart collision detection - swaps block values by type
  const checkCollisions = useCallback(() => {
    if (!heroMode || sprites.length < 2) return

    const currentTime = Date.now()

    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const sprite1 = sprites[i]
        const sprite2 = sprites[j]
        const pairKey = `${sprite1.id}-${sprite2.id}`

        // Prevent rapid successive collisions
        if (lastCollisionRef.current[pairKey] && currentTime - lastCollisionRef.current[pairKey] < 2000) {
          continue
        }

        const distance = Math.sqrt(Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2))

        if (distance < 140) {
          console.log(`🔥 COLLISION DETECTED between ${sprite1.name} and ${sprite2.name}!`)

          // Record collision time
          lastCollisionRef.current[pairKey] = currentTime

          // Get current programs directly from state
          const currentPrograms = spritePrograms
          const program1 = [...(currentPrograms[sprite1.id] || [])]
          const program2 = [...(currentPrograms[sprite2.id] || [])]

          console.log(`📋 ${sprite1.name} program:`, program1)
          console.log(`📋 ${sprite2.name} program:`, program2)

          if (program1.length === 0 && program2.length === 0) {
            console.log("⚠️ No programs to swap!")
            return
          }

          // Create maps of blocks by type for easy matching
          const blocks1ByType = {}
          const blocks2ByType = {}

          program1.forEach((block, index) => {
            if (!blocks1ByType[block.type]) blocks1ByType[block.type] = []
            blocks1ByType[block.type].push({ block, index })
          })

          program2.forEach((block, index) => {
            if (!blocks2ByType[block.type]) blocks2ByType[block.type] = []
            blocks2ByType[block.type].push({ block, index })
          })

          console.log("🗂️ Blocks1ByType:", blocks1ByType)
          console.log("🗂️ Blocks2ByType:", blocks2ByType)

          let swapOccurred = false

          // Swap values for matching block types
          Object.keys(blocks1ByType).forEach((blockType) => {
            if (blocks2ByType[blockType]) {
              const blocks1 = blocks1ByType[blockType]
              const blocks2 = blocks2ByType[blockType]

              // Swap values between corresponding blocks of the same type
              const maxPairs = Math.min(blocks1.length, blocks2.length)

              for (let k = 0; k < maxPairs; k++) {
                const block1 = blocks1[k]
                const block2 = blocks2[k]

                console.log(`🔄 Swapping ${blockType} blocks`)
                const newBlock1 = { ...program1[block1.index] }
                const newBlock2 = { ...program2[block2.index] }

                // Swap values based on block type
                switch (blockType) {
                  case "move":
                  case "turn":
                  case "repeat":
                    // Swap value property
                    const tempValue = program1[block1.index].value
                    program1[block1.index].value = program2[block2.index].value
                    program2[block2.index].value = tempValue
                    swapOccurred = true
                    console.log(`✅ Swapped ${blockType} values: ${tempValue} ↔ ${program1[block1.index].value}`)
                    break

                  case "goto":
                    // Swap x and y coordinates
                    const tempX = program1[block1.index].x
                    const tempY = program1[block1.index].y
                    program1[block1.index].x = program2[block2.index].x
                    program1[block1.index].y = program2[block2.index].y
                    program2[block2.index].x = tempX
                    program2[block2.index].y = tempY
                    swapOccurred = true
                    console.log(`✅ Swapped goto coordinates`)
                    break

                  case "say":
                  case "think":
                    // Swap text and duration
                    const tempText = newBlock1.text
                    const tempDuration = newBlock1.duration

                    console.log(`🔄 BEFORE SWAP - ${sprite1.name} ${blockType}:`, {
                      text: program1[block1.index].text,
                      duration: program1[block1.index].duration,
                    })
                    console.log(`🔄 BEFORE SWAP - ${sprite2.name} ${blockType}:`, {
                      text: program2[block2.index].text,
                      duration: program2[block2.index].duration,
                    })
                      newBlock1.text = newBlock2.text
                      newBlock1.duration = newBlock2.duration
                      newBlock2.text = tempText
                      newBlock2.duration = tempDuration
                      program1[block1.index] = newBlock1;
                      program2[block2.index] = newBlock2;
                      swapOccurred = true

                    console.log(`🔄 AFTER SWAP - ${sprite1.name} ${blockType}:`, {
                      text: program1[block1.index].text,
                      duration: program1[block1.index].duration,
                    })
                    console.log(`🔄 AFTER SWAP - ${sprite2.name} ${blockType}:`, {
                      text: program2[block2.index].text,
                      duration: program2[block2.index].duration,
                    })

                    console.log(`✅ Swapped ${blockType} text: "${tempText}" ↔ "${program1[block1.index].text}"`)
                    break
                }
              }
            }
          })

if (swapOccurred) {
  console.log("🎯 UPDATING PROGRAMS AND BUBBLES...");

  // 1. Update the programs first
  const updatedPrograms = {
    ...spritePrograms,
    [sprite1.id]: program1,
    [sprite2.id]: program2,
  };

  // 2. Immediately update the programs
  setSpritePrograms(updatedPrograms);

  // 3. Force update bubbles by executing the swapped blocks
  setTimeout(() => {
    // Find all say/think blocks in each program
    const sprite1Blocks = program1.filter(b => b.type === "say" || b.type === "think");
    const sprite2Blocks = program2.filter(b => b.type === "say" || b.type === "think");

    // Execute the first say/think block for each sprite
    if (sprite1Blocks.length > 0) {
      const block = sprite1Blocks[0];
      setSpriteBubbles(prev => ({
        ...prev,
        [sprite1.id]: {
          text: block.text,
          type: block.type,
          id: Date.now() // Force re-render with new key
        }
      }));
    }

    if (sprite2Blocks.length > 0) {
      const block = sprite2Blocks[0];
      setSpriteBubbles(prev => ({
        ...prev,
        [sprite2.id]: {
          text: block.text,
          type: block.type,
          id: Date.now() // Force re-render with new key
        }
      }));
    }

    // Clear bubbles after delay
    setTimeout(() => {
      setSpriteBubbles(prev => {
        const updated = {...prev};
        delete updated[sprite1.id];
        delete updated[sprite2.id];
        return updated;
      });
    }, 2000);
  }, 100);
}else {
  console.log("⚠️ No matching block types found for swapping");
}


          // Only handle first collision to avoid multiple swaps
          return
        }
      }
    }
  }, [heroMode, sprites, spritePrograms])

  // Use useEffect only for sprite position changes
  useEffect(() => {
    if (heroMode && sprites.length >= 2) {
      checkCollisions()
    }
  }, [sprites, heroMode, checkCollisions])

  const addSprite = (spriteData) => {
    const newSprite = {
      id: nextSpriteId.toString(),
      name: spriteData.name,
      x: 0,
      y: 0,
      image: spriteData.image,
      rotation: 0,
    }
    setSprites((prev) => [...prev, newSprite])
    setSelectedSprite(newSprite.id)
    setSpritePrograms((prev) => ({ ...prev, [newSprite.id]: [] }))
    setNextSpriteId((prev) => prev + 1)
    setDropdownOpen(false)
  }

  const deleteSprite = (spriteId) => {
    const updatedSprites = sprites.filter((s) => s.id !== spriteId)
    setSprites(updatedSprites)

    setSpritePrograms((prev) => {
      const updated = { ...prev }
      delete updated[spriteId]
      return updated
    })

    setSpriteBubbles((prev) => {
      const updated = { ...prev }
      delete updated[spriteId]
      return updated
    })

    if (selectedSprite === spriteId) {
      setSelectedSprite(updatedSprites.length > 0 ? updatedSprites[0].id : null)
    }
  }

  const removeBlockFromSprite = (spriteId, blockIndex) => {
    setSpritePrograms((prev) => ({
      ...prev,
      [spriteId]: prev[spriteId].filter((_, index) => index !== blockIndex),
    }))
  }

  const updateBlockValue = (spriteId, blockIndex, field, value) => {
    setSpritePrograms((prev) => ({
      ...prev,
      [spriteId]: prev[spriteId].map((block, index) => (index === blockIndex ? { ...block, [field]: value } : block)),
    }))
  }

  // Execute program functions
  const executeProgram = async (blocks, sprite) => {
    const repeatBlockIndex = blocks.findIndex((block) => block.type === "repeat")

    if (repeatBlockIndex !== -1) {
      const repeatBlock = blocks[repeatBlockIndex]
      const repeatCount = Number.parseInt(repeatBlock.value) || 1
      const blocksToRepeat = blocks.filter((_, index) => index !== repeatBlockIndex)

      console.log(`Executing repeat block ${repeatCount} times for ${sprite.name}`)

      if (blocksToRepeat.length > 0) {
        for (let r = 0; r < repeatCount; r++) {
          for (let i = 0; i < blocksToRepeat.length; i++) {
            await new Promise((resolve) => {
              setTimeout(() => {
                executeBlock(blocksToRepeat[i], sprite)
                resolve()
              }, 300)
            })
          }

          if (r < repeatCount - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200))
          }
        }
      }
    } else {
      for (let i = 0; i < blocks.length; i++) {
        await new Promise((resolve) => {
          setTimeout(() => {
            executeBlock(blocks[i], sprite)
            resolve()
          }, 300)
        })
      }
    }
  }

  const executeBlock = (block, sprite) => {
    setSprites((prevSprites) => {
      return prevSprites.map((s) => {
        if (s.id !== sprite.id) return s

        const updatedSprite = { ...s }

        switch (block.type) {
          case "move":
            const steps = Number.parseInt(block.value) || 10
            const radians = (updatedSprite.rotation * Math.PI) / 180
            const newX = updatedSprite.x + Math.cos(radians) * steps
            const newY = updatedSprite.y + Math.sin(radians) * steps
            const constrained = constrainToCanvas(newX, newY)
            updatedSprite.x = constrained.x
            updatedSprite.y = constrained.y
            break

          case "turn":
            const degrees = Number.parseInt(block.value) || 30
            updatedSprite.rotation += degrees
            break

          case "goto":
            const gotoX = Number.parseInt(block.x) || 0
            const gotoY = Number.parseInt(block.y) || 0
            const constrainedGoto = constrainToCanvas(gotoX, gotoY)
            updatedSprite.x = constrainedGoto.x
            updatedSprite.y = constrainedGoto.y
            break

          case "say":
            setSpriteBubbles((prev) => ({
              ...prev,
              [sprite.id]: { text: block.text, type: "say" },
            }))
            setTimeout(
              () => {
                setSpriteBubbles((prev) => {
                  const updated = { ...prev }
                  delete updated[sprite.id]
                  return updated
                })
              },
              (Number.parseInt(block.duration) || 2) * 1000,
            )
            break

          case "think":
            setSpriteBubbles((prev) => ({
              ...prev,
              [sprite.id]: { text: block.text, type: "think" },
            }))
            setTimeout(
              () => {
                setSpriteBubbles((prev) => {
                  const updated = { ...prev }
                  delete updated[sprite.id]
                  return updated
                })
              },
              (Number.parseInt(block.duration) || 2) * 1000,
            )
            break
        }

        return updatedSprite
      })
    })
  }

  const executeAllBlocks = () => {
    sprites.forEach((sprite) => {
      const program = spritePrograms[sprite.id] || []
      if (program.length > 0) {
        executeProgram(program, sprite)
      }
    })
  }

  // Ultra-smooth sprite dragging
  const handleSpriteMouseDown = useCallback(
    (e, sprite) => {
      e.preventDefault()
      e.stopPropagation()

      setSelectedSprite(sprite.id)
      dragStateRef.current.isDragging = true
      dragStateRef.current.draggedSprite = sprite.id

      const startMouseX = e.clientX
      const startMouseY = e.clientY
      const startSpriteX = sprite.x
      const startSpriteY = sprite.y

      const spriteElement = e.currentTarget

      const handleMouseMove = (e) => {
        if (!dragStateRef.current.isDragging) return

        const deltaX = e.clientX - startMouseX
        const deltaY = e.clientY - startMouseY
        const newX = startSpriteX + deltaX
        const newY = startSpriteY + deltaY

        const constrained = constrainToCanvas(newX, newY)

        spriteElement.style.left = `calc(50% + ${constrained.x}px)`
        spriteElement.style.top = `calc(50% + ${constrained.y}px)`
      }

      const handleMouseUp = () => {
        if (!dragStateRef.current.isDragging) return

        dragStateRef.current.isDragging = false
        dragStateRef.current.draggedSprite = null

        const deltaX = window.event?.clientX - startMouseX || 0
        const deltaY = window.event?.clientY - startMouseY || 0
        const finalX = startSpriteX + deltaX
        const finalY = startSpriteY + deltaY
        const constrainedFinal = constrainToCanvas(finalX, finalY)

        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? { ...s, x: constrainedFinal.x, y: constrainedFinal.y } : s)),
        )

        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [constrainToCanvas],
  )

  const handleBlockDragStart = (e, block) => {
    const blockCopy = { ...block }
    const blockElement = e.target
    const inputs = blockElement.querySelectorAll("input")

    if (block.type === "goto") {
      if (inputs[0]) blockCopy.x = inputs[0].value
      if (inputs[1]) blockCopy.y = inputs[1].value
    } else if (block.type === "say" || block.type === "think") {
      if (inputs[0]) blockCopy.text = inputs[0].value
      if (inputs[1]) blockCopy.duration = inputs[1].value
    } else {
      if (inputs[0]) blockCopy.value = inputs[0].value
    }

    setDraggedBlock(blockCopy)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleSpriteDrop = (e, sprite) => {
    e.preventDefault()
    if (draggedBlock) {
      setSpritePrograms((prev) => ({
        ...prev,
        [sprite.id]: [...(prev[sprite.id] || []), { ...draggedBlock, id: Date.now() }],
      }))
      setDraggedBlock(null)
    }
  }

  const handleSpriteDragOver = (e) => {
    e.preventDefault()
  }

  const renderMotionBlock = (block, index) => {
    return (
      <div
        key={index}
        className="bg-blue-500 text-white p-2 rounded text-sm cursor-grab hover:bg-blue-600 active:cursor-grabbing"
        draggable
        onDragStart={(e) => handleBlockDragStart(e, block)}
      >
        {block.type === "goto" ? (
          <div className="flex items-center gap-1">
            <span>{block.label}</span>
            <input
              className="w-8 h-4 text-xs text-black px-1 rounded"
              defaultValue={block.x}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                block.x = e.target.value
              }}
            />
            <input
              className="w-8 h-4 text-xs text-black px-1 rounded"
              defaultValue={block.y}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                block.y = e.target.value
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span>{block.label}</span>
            <input
              className="w-10 h-4 text-xs text-black px-1 rounded"
              defaultValue={block.value}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                block.value = e.target.value
              }}
            />
            <span className="text-xs">{block.unit}</span>
          </div>
        )}
      </div>
    )
  }

  const renderLooksBlock = (block, index) => {
    return (
      <div
        key={index}
        className="bg-purple-500 text-white p-2 rounded text-sm cursor-grab hover:bg-purple-600 active:cursor-grabbing"
        draggable
        onDragStart={(e) => handleBlockDragStart(e, block)}
      >
        <div className="flex items-center gap-1 flex-wrap">
          <span>{block.label}</span>
          <input
            className="w-16 h-4 text-xs text-black px-1 rounded"
            defaultValue={block.text}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              block.text = e.target.value
            }}
          />
          <span className="text-xs">for</span>
          <input
            className="w-8 h-4 text-xs text-black px-1 rounded"
            defaultValue={block.duration}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              block.duration = e.target.value
            }}
          />
          <span className="text-xs">{block.unit}</span>
        </div>
      </div>
    )
  }

  const renderSprite = (sprite) => {
    const program = spritePrograms[sprite.id] || []
    const bubble = spriteBubbles[sprite.id]

    return (
      <div
        key={sprite.id}
        className={`absolute cursor-pointer transition-all duration-200 select-none ${
          selectedSprite === sprite.id ? "ring-4 ring-blue-500 ring-offset-4" : ""
        } ${draggedBlock ? "ring-4 ring-green-400 ring-dashed" : ""}`}
        style={{
          left: `calc(50% + ${sprite.x}px)`,
          top: `calc(50% + ${sprite.y}px)`,
          transform: `translate(-50%, -50%) rotate(${sprite.rotation}deg)`,
        }}
        onClick={(e) => {
          if (!dragStateRef.current.isDragging) {
            setSelectedSprite(sprite.id)
          }
        }}
        onDoubleClick={() => deleteSprite(sprite.id)}
        onMouseDown={(e) => handleSpriteMouseDown(e, sprite)}
        onDrop={(e) => handleSpriteDrop(e, sprite)}
        onDragOver={handleSpriteDragOver}
      >
        {/* Speech Bubble */}
       {bubble && (
  <div 
    key={`bubble-${sprite.id}-${bubble.id}`} // Use the unique id we added
    className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-10 animate-fadeIn"
  >
    <div className={`relative px-4 py-3 rounded-lg text-base whitespace-nowrap ${
      bubble.type === "say" 
        ? "bg-white border-2 border-gray-300" 
        : "bg-gray-100 border-2 border-gray-400"
    }`}>
      <span className="text-gray-800 font-medium">{bubble.text}</span>
      <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 ${
        bubble.type === "say" 
          ? "border-t-white" 
          : "border-t-gray-100"
      } border-l-6 border-r-6 border-t-10 border-transparent`} />
    </div>
  </div>
)}

        {/* Sprite image */}
        <img
          src={sprite.image || "/placeholder.svg?height=120&width=120"}
          alt={sprite.name}
          className="w-36 h-36 object-contain pointer-events-none"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=120&width=120"
          }}
          draggable={false}
        />

        {selectedSprite === sprite.id && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-sm px-3 py-2 rounded whitespace-nowrap font-medium">
            {sprite.name} ({program.length} blocks)
          </div>
        )}
      </div>
    )
  }

  const renderSpriteProgram = (sprite) => {
    const program = spritePrograms[sprite.id] || []

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded border">
        <h4 className="font-semibold text-sm mb-2">{sprite.name}'s Program:</h4>
        {program.length === 0 ? (
          <div className="text-xs text-gray-500">No blocks assigned</div>
        ) : (
          <div className="space-y-1">
            {program.map((block, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded text-xs">
                <div className="flex-1">
                  {block.type === "goto" ? (
                    <div className="flex items-center gap-1">
                      <span>{block.label}</span>
                      <input
                        className="w-8 h-4 text-xs border rounded px-1"
                        value={block.x}
                        onChange={(e) => updateBlockValue(sprite.id, index, "x", e.target.value)}
                      />
                      <input
                        className="w-8 h-4 text-xs border rounded px-1"
                        value={block.y}
                        onChange={(e) => updateBlockValue(sprite.id, index, "y", e.target.value)}
                      />
                    </div>
                  ) : block.type === "say" || block.type === "think" ? (
                    <div className="flex items-center gap-1">
                      <span>{block.label}</span>
                      <input
                        className="w-16 h-4 text-xs border rounded px-1"
                        value={block.text}
                        onChange={(e) => updateBlockValue(sprite.id, index, "text", e.target.value)}
                      />
                      <span>for</span>
                      <input
                        className="w-8 h-4 text-xs border rounded px-1"
                        value={block.duration}
                        onChange={(e) => updateBlockValue(sprite.id, index, "duration", e.target.value)}
                      />
                      <span>sec</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>{block.label}</span>
                      <input
                        className="w-10 h-4 text-xs border rounded px-1"
                        value={block.value}
                        onChange={(e) => updateBlockValue(sprite.id, index, "value", e.target.value)}
                      />
                      <span>{block.unit}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeBlockFromSprite(sprite.id, index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {sprites.length === 0 ? (
            <div className="text-gray-500 text-sm">No sprites added yet</div>
          ) : (
            sprites.map((sprite) => (
              <div
                key={sprite.id}
                className={`flex items-center gap-2 px-4 py-2 rounded border cursor-pointer transition-colors ${
                  selectedSprite === sprite.id
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSprite(sprite.id)}
              >
                <img
                  src={sprite.image || "/placeholder.svg?height=24&width=24"}
                  alt={sprite.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=24&width=24"
                  }}
                />
                <span className="text-sm font-medium">{sprite.name}</span>
                <button
                  className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSprite(sprite.id)
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Blocks Palette */}
        <div className="w-54 bg-gray-100 border-r overflow-y-auto">
          {/* Motion Section */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-700 mb-3">Motion</h3>
            <div className="space-y-2">{motionBlocks.map((block, index) => renderMotionBlock(block, index))}</div>
          </div>

          {/* Looks Section */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-700 mb-3">Looks</h3>
            <div className="space-y-2">{looksBlocks.map((block, index) => renderLooksBlock(block, index))}</div>
          </div>

          {/* Selected Sprite Program */}
          {currentSprite && renderSpriteProgram(currentSprite)}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-white overflow-hidden" ref={canvasRef}>
          {/* Canvas boundary indicator */}
          <div className="absolute inset-0 border-4 border-gray-300 border-dashed opacity-20 pointer-events-none"></div>

          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Sprites */}
          {sprites.map((sprite) => renderSprite(sprite))}

          {/* Sprite Info */}
          {currentSprite && (
            <div className="absolute bottom-16 left-4 bg-white p-3 rounded shadow border">
              <span className="text-sm text-gray-600 font-medium">
                {currentSprite.name}: {Math.round(currentSprite.x)},{Math.round(currentSprite.y)} | Rotation:{" "}
                {currentSprite.rotation}°
              </span>
            </div>
          )}

          {/* Empty State */}
          {sprites.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-xl mb-2">No sprites yet!</div>
                <div className="text-base">Click "Add Sprite" to get started</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-white border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            onClick={executeAllBlocks}
            disabled={sprites.length === 0}
          >
            Play All
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
            onClick={() => {
              setSprites((prev) => prev.map((s) => ({ ...s, x: 0, y: 0, rotation: 0 })))
              setSpritePrograms({})
              setSpriteBubbles({})
              lastCollisionRef.current = {} // Reset collision tracking
            }}
            disabled={sprites.length === 0}
          >
            Reset All
          </Button>
          <div className="flex items-center gap-2">
            <Checkbox id="hero-mode" checked={heroMode} onCheckedChange={setHeroMode} />
            <label htmlFor="hero-mode" className="text-sm text-gray-700 font-medium">
              Hero Mode {heroMode && "(Smart Value Swapping)"}
            </label>
          </div>
        </div>

        {/* Custom Dropdown Implementation */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent px-6 py-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Add Sprite
            <ChevronDown className="w-4 h-4" />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {availableSprites.map((sprite, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    onClick={() => addSprite(sprite)}
                  >
                    <img
                      src={sprite.image || "/placeholder.svg?height=40&width=40"}
                      alt={sprite.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                    <span>{sprite.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
